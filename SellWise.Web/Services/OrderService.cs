using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Order;

namespace SellWise.Web.Services;

public class OrderService : IOrderService
{
    public static readonly string[] AllowedStatuses = { "pending", "processing", "delivered", "completed", "cancelled", "returned" };

    private readonly AppDbContext _db;
    private readonly ILogger<OrderService> _logger;

    public OrderService(AppDbContext db, ILogger<OrderService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>Cancelled and returned orders don't count towards revenue, stock or customer totals.</summary>
    public static bool CountsAsSale(string status) => status != "cancelled" && status != "returned";

    public async Task<(decimal TodayRevenue, int TodayOrdersCount, int PendingOrdersCount)> GetDashboardKpisAsync(Guid storeId)
    {
        var today = DateTime.UtcNow.Date;
        var kpis = await _db.Orders
            .Where(o => o.StoreId == storeId)
            .GroupBy(o => 1)
            .Select(g => new
            {
                TodayRevenue = g.Where(o => o.OrderDate >= today && o.Status != "cancelled" && o.Status != "returned").Sum(o => o.Total),
                TodayOrdersCount = g.Count(o => o.OrderDate >= today),
                PendingOrdersCount = g.Count(o => o.Status == "pending" || o.Status == "processing")
            })
            .FirstOrDefaultAsync();

        return kpis == null ? (0m, 0, 0) : (kpis.TodayRevenue, kpis.TodayOrdersCount, kpis.PendingOrdersCount);
    }

    /// <summary>
    /// Creates an order, decrements stock and updates the customer's totals in one transaction.
    /// Returns an error message, or <c>null</c> on success.
    /// </summary>
    public async Task<string?> CreateOrderAsync(Guid storeId, OrderFormViewModel model, string? salespersonName = null)
    {
        // The same product may appear on several lines; treat it as one line with the combined quantity
        // so the stock check can't be bypassed by splitting a quantity across lines.
        var lines = model.Items
            .Where(i => i.ProductId != Guid.Empty && i.Quantity > 0)
            .GroupBy(i => i.ProductId)
            .Select(g => (ProductId: g.Key, Quantity: g.Sum(i => i.Quantity)))
            .ToList();

        if (lines.Count == 0)
            return "Please add at least one product to the order.";

        var isWalkIn = string.IsNullOrEmpty(model.OrderType) || model.OrderType.Equals("offline", StringComparison.OrdinalIgnoreCase);
        var deliveryCharge = isWalkIn ? 0m : model.DeliveryCharge;

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var productIds = lines.Select(l => l.ProductId).ToList();
            var products = await _db.Products
                .AsNoTracking()
                .Where(p => productIds.Contains(p.Id) && p.StoreId == storeId && p.IsActive)
                .ToDictionaryAsync(p => p.Id);

            var order = new Order
            {
                StoreId = storeId,
                OrderType = isWalkIn ? "offline" : "online",
                Status = isWalkIn ? "completed" : "pending",
                DeliveryCharge = deliveryCharge,
                Discount = model.Discount,
                Notes = model.Notes,
                SalespersonName = salespersonName,
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}"
            };

            decimal subtotal = 0;
            foreach (var (productId, quantity) in lines)
            {
                if (!products.TryGetValue(productId, out var product))
                    return await FailAsync(transaction, "Product not found in your store.");

                // Check and decrement in a single UPDATE so two checkouts running at the same
                // time can't both sell the last unit (no read-then-write race).
                var updatedRows = await _db.Products
                    .Where(p => p.Id == productId && p.StockQuantity >= quantity)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(p => p.StockQuantity, p => p.StockQuantity - quantity)
                        .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));

                if (updatedRows == 0)
                    return await FailAsync(transaction, $"Insufficient stock for {product.Name}.");

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.SellingPrice,
                    CostPrice = product.CostPrice,
                    Quantity = quantity
                });
                subtotal += product.SellingPrice * quantity;
            }

            if (model.Discount > subtotal + deliveryCharge)
                return await FailAsync(transaction, "Discount cannot exceed the order total.");

            order.Total = subtotal + deliveryCharge - model.Discount;

            var customer = await ResolveCustomerAsync(storeId, model);
            if (model.CustomerId.HasValue && customer == null)
                return await FailAsync(transaction, "Customer not found in your store.");

            if (customer != null)
            {
                order.Customer = customer;
                customer.TotalOrders++;
                customer.TotalSpent += order.Total;
                customer.LastOrderDate = order.OrderDate;
                customer.UpdatedAt = DateTime.UtcNow;
            }

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return null;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to create order for store {StoreId}", storeId);
            return "An error occurred while creating the order.";
        }
    }

    /// <summary>
    /// Changes an order's status. Moving into cancelled/returned puts the stock back and
    /// reverses the customer's totals; moving out of it does the opposite.
    /// </summary>
    public async Task<string?> ChangeOrderStatusAsync(Guid orderId, Guid storeId, string newStatus)
    {
        var status = newStatus?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(status) || !AllowedStatuses.Contains(status))
            return "Invalid status.";

        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.StoreId == storeId);

        if (order == null) return "Order not found.";
        if (order.Status == status) return null;

        var wasSale = CountsAsSale(order.Status);
        var isSale = CountsAsSale(status);

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            if (wasSale && !isSale)
            {
                foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
                {
                    await _db.Products
                        .Where(p => p.Id == item.ProductId && p.StoreId == storeId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity + item.Quantity));
                }
                AdjustCustomerTotals(order, direction: -1);
            }
            else if (!wasSale && isSale)
            {
                foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
                {
                    var updatedRows = await _db.Products
                        .Where(p => p.Id == item.ProductId && p.StoreId == storeId && p.StockQuantity >= item.Quantity)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - item.Quantity));

                    if (updatedRows == 0)
                        return await FailAsync(transaction, $"Not enough stock for {item.ProductName} to reactivate this order.");
                }
                AdjustCustomerTotals(order, direction: +1);
            }

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return null;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to change status of order {OrderId}", orderId);
            return "An error occurred while updating the order status.";
        }
    }

    private async Task<Customer?> ResolveCustomerAsync(Guid storeId, OrderFormViewModel model)
    {
        if (model.CustomerId.HasValue)
            return await _db.Customers.FirstOrDefaultAsync(c => c.Id == model.CustomerId.Value && c.StoreId == storeId);

        if (string.IsNullOrWhiteSpace(model.NewCustomerName))
            return null;

        return new Customer
        {
            StoreId = storeId,
            Name = model.NewCustomerName.Trim(),
            Phone = model.NewCustomerPhone?.Trim(),
            Address = model.NewCustomerAddress?.Trim()
        };
    }

    private static void AdjustCustomerTotals(Order order, int direction)
    {
        if (order.Customer == null) return;
        order.Customer.TotalOrders += direction;
        order.Customer.TotalSpent += direction * order.Total;
        order.Customer.UpdatedAt = DateTime.UtcNow;
    }

    private static async Task<string> FailAsync(Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction, string error)
    {
        await transaction.RollbackAsync();
        return error;
    }
}
