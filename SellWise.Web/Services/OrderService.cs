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

    public async Task<string?> CreateOrderAsync(Guid storeId, OrderFormViewModel model)
    {
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            if (model.CustomerId == null && !string.IsNullOrWhiteSpace(model.CustomerName))
            {
                var customer = new Customer { StoreId = storeId, Name = model.CustomerName };
                _db.Customers.Add(customer);
                await _db.SaveChangesAsync();
                model.CustomerId = customer.Id;
            }

            var order = new Order
            {
                StoreId = storeId,
                CustomerId = model.CustomerId,
                Source = model.Source,
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

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.SellingPrice,
                    CostPrice = product.CostPrice,
                    Quantity = item.Quantity
                };
                order.Items.Add(orderItem);
                subtotal += (product.SellingPrice * item.Quantity);
                
                product.StockQuantity -= item.Quantity;
            }

            if (model.Discount > subtotal + model.DeliveryCharge)
            {
                await transaction.RollbackAsync();
                return "Discount cannot exceed the order total.";
            }

            order.Total = subtotal + model.DeliveryCharge - model.Discount;

            _db.Orders.Add(order);
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
}
