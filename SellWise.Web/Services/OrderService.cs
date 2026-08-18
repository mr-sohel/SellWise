using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Order;
using Microsoft.Extensions.Logging;

namespace SellWise.Web.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly ILogger<OrderService> _logger;

    public OrderService(AppDbContext db, ILogger<OrderService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(decimal TodayRevenue, int TodayOrdersCount, int PendingOrdersCount)> GetDashboardKpisAsync(Guid storeId)
    {
        var today = DateTime.UtcNow.Date;
        var kpis = await _db.Orders
            .Where(o => o.StoreId == storeId)
            .GroupBy(o => 1)
            .Select(g => new {
                TodayRevenue = g.Where(o => o.OrderDate >= today && o.Status != "cancelled" && o.Status != "returned").Sum(o => o.Total),
                TodayOrdersCount = g.Count(o => o.OrderDate >= today),
                PendingOrdersCount = g.Count(o => o.Status == "pending" || o.Status == "processing")
            })
            .FirstOrDefaultAsync();

        if (kpis == null) return (0m, 0, 0);
        return (kpis.TodayRevenue, kpis.TodayOrdersCount, kpis.PendingOrdersCount);
    }

    public async Task<string?> CreateOrderAsync(Guid storeId, OrderFormViewModel model)
    {
        // START TRANSACTION: We use a database transaction to ensure ACID properties.
        // If anything fails (e.g., out of stock), the entire operation rolls back,
        // preventing partial data like saving an order but not deducting stock.
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            Guid? finalCustomerId = model.CustomerId;
            Customer? newCustomerEntity = null;

            if (model.CustomerId.HasValue)
            {
                var customerExists = await _db.Customers
                    .AnyAsync(c => c.Id == model.CustomerId.Value && c.StoreId == storeId);
                if (!customerExists)
                {
                    await transaction.RollbackAsync();
                    return "Customer not found in your store.";
                }
            }
            else if (!string.IsNullOrWhiteSpace(model.NewCustomerName))
            {
                newCustomerEntity = new Customer
                {
                    StoreId = storeId,
                    Name = model.NewCustomerName,
                    Phone = model.NewCustomerPhone,
                    Address = model.NewCustomerAddress,
                    TotalOrders = 0,
                    TotalSpent = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                // Altitude #4 and Efficiency #2 fix: Do not save immediately. Let EF Core handle insertion.
            }

            var order = new Order
            {
                StoreId = storeId,
                CustomerId = finalCustomerId,
                Customer = newCustomerEntity,
                DeliveryCharge = model.DeliveryCharge,
                Discount = model.Discount,
                Notes = model.Notes,
                Status = "pending",
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}"
            };

            decimal subtotal = 0;
            var validItems = model.Items.Where(i => i.ProductId != Guid.Empty && i.Quantity > 0).ToList();
            var productIds = validItems.Select(i => i.ProductId).Distinct().ToList();

            var productsDict = await _db.Products
                .Where(p => productIds.Contains(p.Id) && p.StoreId == storeId)
                .ToDictionaryAsync(p => p.Id);

            foreach (var item in validItems)
            {
                if (!productsDict.TryGetValue(item.ProductId, out var product))
                {
                    await transaction.RollbackAsync();
                    return $"Product not found in your store.";
                }

                if (product.StockQuantity < item.Quantity)
                {
                    await transaction.RollbackAsync();
                    return $"Insufficient stock for {product.Name}. Available: {product.StockQuantity}, requested: {item.Quantity}.";
                }

                subtotal += (product.SellingPrice * item.Quantity);
            }

            if (model.Discount > subtotal + model.DeliveryCharge)
            {
                await transaction.RollbackAsync();
                return "Discount cannot exceed the order total.";
            }

            // DEDUCT STOCK & CREATE ORDER ITEMS
            foreach (var item in validItems)
            {
                var product = productsDict[item.ProductId];
                
                // Crucial business logic: deduct the exact quantity ordered from the inventory
                product.StockQuantity -= item.Quantity;

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.SellingPrice,
                    CostPrice = product.CostPrice,
                    Quantity = item.Quantity
                };
                order.Items.Add(orderItem);
            }

            order.Total = subtotal + model.DeliveryCharge - model.Discount;

            // Fix Data Consistency: Update Customer Metrics
            if (model.CustomerId.HasValue)
            {
                // We checked existence earlier, but now we actually need the entity to update it
                var existingCustomer = await _db.Customers.FirstAsync(c => c.Id == model.CustomerId.Value && c.StoreId == storeId);
                existingCustomer.TotalOrders++;
                existingCustomer.TotalSpent += order.Total;
                existingCustomer.UpdatedAt = DateTime.UtcNow;
            }
            else if (newCustomerEntity != null)
            {
                newCustomerEntity.TotalOrders = 1;
                newCustomerEntity.TotalSpent = order.Total;
            }

            _db.Orders.Add(order);
            
            // Save changes to the database and commit the transaction permanently
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return null; // Success
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "An error occurred while creating the order.");
            return "An error occurred while creating the order.";
        }
    }


    public async Task<string?> ChangeOrderStatusAsync(Guid orderId, Guid storeId, string newStatus)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.StoreId == storeId);
        
        if (order == null) return "Order not found.";

        var allowedStatuses = new[] { "pending", "processing", "delivered", "completed", "cancelled", "returned" };
        var sanitized = newStatus?.ToLower().Trim();

        if (string.IsNullOrEmpty(sanitized) || !allowedStatuses.Contains(sanitized))
        {
            return "Invalid status.";
        }

        if (order.Status == sanitized)
        {
            return null; // No change needed
        }

        var oldStatus = order.Status;
        var wasActive = oldStatus != "cancelled" && oldStatus != "returned";
        var willBeActive = sanitized != "cancelled" && sanitized != "returned";

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Batch fetch all products for the order items to avoid N+1 query issue (Efficiency #2 / Simplification #5)
            var productIds = order.Items.Where(i => i.ProductId.HasValue).Select(i => i.ProductId ?? Guid.Empty).ToList();
            var productsDict = await _db.Products
                .Where(p => productIds.Contains(p.Id) && p.StoreId == storeId)
                .ToDictionaryAsync(p => p.Id);

            // Restore stock when cancelling or returning a previously active order
            if (wasActive && !willBeActive)
            {
                foreach (var item in order.Items)
                {
                    if (item.ProductId.HasValue && productsDict.TryGetValue(item.ProductId.Value, out var product))
                    {
                        product.StockQuantity += item.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            // Re-deduct stock when reactivating a cancelled/returned order
            else if (!wasActive && willBeActive)
            {
                foreach (var item in order.Items)
                {
                    if (item.ProductId.HasValue && productsDict.TryGetValue(item.ProductId.Value, out var product))
                    {
                        if (product.StockQuantity < item.Quantity)
                        {
                            await transaction.RollbackAsync();
                            return $"Insufficient stock for {product.Name} to reactivate this order. Available: {product.StockQuantity}, needed: {item.Quantity}.";
                        }
                        product.StockQuantity -= item.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            order.Status = sanitized;
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return null; // Success
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "An error occurred while updating the order status for Order ID {OrderId}.", orderId); // Altitude #4 fix
            return "An error occurred while updating the order status.";
        }
    }
}
