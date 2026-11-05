using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Order;

namespace SellWise.Web.Services;

/// <summary>
/// Order rules. Everything that two cashiers could do at the same moment (sell the same stock,
/// update the same customer, change the same order) is done with single atomic UPDATE
/// statements instead of read-modify-write, so concurrent requests can't overwrite each other.
/// </summary>
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
            .Select(g => new
            {
                TodayRevenue = g.Where(o => o.OrderDate >= today && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Returned).Sum(o => o.Total),
                TodayOrdersCount = g.Count(o => o.OrderDate >= today),
                PendingOrdersCount = g.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Processing)
            })
            .FirstOrDefaultAsync();

        return kpis == null ? (0m, 0, 0) : (kpis.TodayRevenue, kpis.TodayOrdersCount, kpis.PendingOrdersCount);
    }

    /// <summary>
    /// Creates an order, decrements stock and updates the customer's totals in one transaction.
    /// Returns an error message, or <c>null</c> on success.
    /// </summary>
    /// <remarks>
    /// Checkout is idempotent: the POS form carries a one-time <see cref="OrderFormViewModel.IdempotencyKey"/>.
    /// If the same submission arrives twice (double click, network retry), only one order is created
    /// and the repeat is reported as success.
    /// </remarks>
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

        if (await IsAlreadyPlacedAsync(storeId, model.IdempotencyKey))
            return null;

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
                IdempotencyKey = model.IdempotencyKey,
                OrderType = isWalkIn ? "offline" : "online",
                Status = isWalkIn ? OrderStatus.Completed : OrderStatus.Pending,
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

            var customerError = await AttachCustomerAsync(storeId, model, order);
            if (customerError != null)
                return await FailAsync(transaction, customerError);

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return null;
        }
        catch (DbUpdateException ex)
        {
            await transaction.RollbackAsync();
            _db.ChangeTracker.Clear();

            // Two identical submissions raced past the check above; the unique index on
            // (StoreId, IdempotencyKey) let only one of them in. The other one is not an error.
            if (await IsAlreadyPlacedAsync(storeId, model.IdempotencyKey))
                return null;

            _logger.LogError(ex, "Failed to save order for store {StoreId}", storeId);
            return "The order could not be saved. Please try again.";
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to create order for store {StoreId}", storeId);
            return "An error occurred while creating the order.";
        }
    }

    /// <summary>
    /// Changes an order's status if the transition is allowed. Moving into cancelled/returned puts
    /// the stock back and reverses the customer's totals; re-opening a cancelled order does the opposite.
    /// </summary>
    public async Task<string?> ChangeOrderStatusAsync(Guid orderId, Guid storeId, string newStatus)
    {
        var status = newStatus?.Trim().ToLowerInvariant() ?? "";

        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.StoreId == storeId);

        if (order == null) return "Order not found.";
        if (order.Status == status) return null;
        if (!OrderStatus.CanChange(order.Status, status))
            return $"An order that is {order.Status} can't be changed to {status}.";

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Compare-and-swap: only update if the status is still what we read above. If two
            // people cancel the same order at once, the second UPDATE waits for the first to
            // commit, then matches 0 rows - so stock is restored exactly once.
            var claimed = await _db.Orders
                .Where(o => o.Id == orderId && o.Status == order.Status)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(o => o.Status, status)
                    .SetProperty(o => o.UpdatedAt, DateTime.UtcNow));

            if (claimed == 0)
                return await FailAsync(transaction, "This order was just changed by someone else. Refresh and try again.");

            var wasSale = OrderStatus.CountsAsSale(order.Status);
            var isSale = OrderStatus.CountsAsSale(status);

            if (wasSale && !isSale)
            {
                foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
                {
                    await _db.Products
                        .Where(p => p.Id == item.ProductId && p.StoreId == storeId)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity + item.Quantity));
                }
                await AdjustCustomerTotalsAsync(order.CustomerId, orders: -1, spent: -order.Total);
            }
            else if (!wasSale && isSale)
            {
                foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
                {
                    var updatedRows = await _db.Products
                        .Where(p => p.Id == item.ProductId && p.StoreId == storeId && p.StockQuantity >= item.Quantity)
                        .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - item.Quantity));

                    if (updatedRows == 0)
                        return await FailAsync(transaction, $"Not enough stock for {item.ProductName} to re-open this order.");
                }
                await AdjustCustomerTotalsAsync(order.CustomerId, orders: +1, spent: order.Total);
            }

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

    private async Task<bool> IsAlreadyPlacedAsync(Guid storeId, Guid? idempotencyKey) =>
        idempotencyKey.HasValue
        && await _db.Orders.AnyAsync(o => o.StoreId == storeId && o.IdempotencyKey == idempotencyKey);

    /// <summary>
    /// Links the order to an existing customer (selected, or matched by phone) and bumps their
    /// totals atomically, or creates a new customer with the order. Returns an error or null.
    /// </summary>
    private async Task<string?> AttachCustomerAsync(Guid storeId, OrderFormViewModel model, Order order)
    {
        Guid? existingId = model.CustomerId;

        if (existingId.HasValue)
        {
            if (!await _db.Customers.AnyAsync(c => c.Id == existingId && c.StoreId == storeId))
                return "Customer not found in your store.";
        }
        else if (!string.IsNullOrWhiteSpace(model.NewCustomerName))
        {
            // Reuse the customer if this phone number is already on file, instead of creating a duplicate.
            var phone = model.NewCustomerPhone?.Trim();
            if (!string.IsNullOrEmpty(phone))
            {
                existingId = await _db.Customers
                    .Where(c => c.StoreId == storeId && c.Phone == phone)
                    .Select(c => (Guid?)c.Id)
                    .FirstOrDefaultAsync();
            }

            if (existingId == null)
            {
                order.Customer = new Customer
                {
                    StoreId = storeId,
                    Name = model.NewCustomerName.Trim(),
                    Phone = phone,
                    Address = model.NewCustomerAddress?.Trim(),
                    TotalOrders = 1,
                    TotalSpent = order.Total,
                    LastOrderDate = order.OrderDate
                };
                return null;
            }
        }

        if (existingId.HasValue)
        {
            order.CustomerId = existingId;
            await AdjustCustomerTotalsAsync(existingId, orders: +1, spent: order.Total, lastOrderDate: order.OrderDate);
        }

        return null;
    }

    /// <summary>
    /// Atomic increment (UPDATE ... SET TotalOrders = TotalOrders + 1). Loading the customer,
    /// adding 1 and saving would lose an update when two orders for the same customer overlap.
    /// </summary>
    private async Task AdjustCustomerTotalsAsync(Guid? customerId, int orders, decimal spent, DateTime? lastOrderDate = null)
    {
        if (customerId == null) return;

        await _db.Customers
            .Where(c => c.Id == customerId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.TotalOrders, c => c.TotalOrders + orders)
                .SetProperty(c => c.TotalSpent, c => c.TotalSpent + spent)
                .SetProperty(c => c.LastOrderDate, c => lastOrderDate ?? c.LastOrderDate)
                .SetProperty(c => c.UpdatedAt, DateTime.UtcNow));
    }

    private static async Task<string> FailAsync(IDbContextTransaction transaction, string error)
    {
        await transaction.RollbackAsync();
        return error;
    }
}
