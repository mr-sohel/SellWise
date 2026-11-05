using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using SellWise.Web.Services;
using SellWise.Web.ViewModels.Order;

namespace SellWise.Tests.Unit;

public class OrderServiceTests : IDisposable
{
    private readonly TestDb _db = new();

    public void Dispose() => _db.Dispose();

    private OrderService CreateService() => new(_db.CreateContext(), NullLogger<OrderService>.Instance);

    private static OrderFormViewModel Order(params (Guid ProductId, int Quantity)[] lines) => new()
    {
        Items = lines.Select(l => new OrderItemViewModel { ProductId = l.ProductId, Quantity = l.Quantity }).ToList()
    };

    [Fact]
    public async Task CreateOrder_DecrementsStock_AndCalculatesTotal()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 10, price: 250m);

        var error = await CreateService().CreateOrderAsync(store.Id, Order((product.Id, 3)));

        Assert.Null(error);
        Assert.Equal(7, _db.StockOf(product.Id));
        using var ctx = _db.CreateContext();
        var order = await ctx.Orders.Include(o => o.Items).SingleAsync();
        Assert.Equal(750m, order.Total);
        Assert.Equal("completed", order.Status);
    }

    [Fact]
    public async Task CreateOrder_WithInsufficientStock_FailsAndRollsBack()
    {
        var store = _db.AddStore();
        var plenty = _db.AddProduct(store.Id, stock: 10, name: "Plenty");
        var scarce = _db.AddProduct(store.Id, stock: 1, name: "Scarce");

        var error = await CreateService().CreateOrderAsync(store.Id, Order((plenty.Id, 2), (scarce.Id, 5)));

        Assert.Contains("Insufficient stock", error);
        // The first line's decrement must be rolled back too.
        Assert.Equal(10, _db.StockOf(plenty.Id));
        Assert.Equal(1, _db.StockOf(scarce.Id));
        using var ctx = _db.CreateContext();
        Assert.Empty(ctx.Orders);
    }

    [Fact]
    public async Task CreateOrder_MergesDuplicateLines_BeforeCheckingStock()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5);

        // 3 + 3 = 6 > 5: splitting the quantity across lines must not bypass the check.
        var error = await CreateService().CreateOrderAsync(store.Id, Order((product.Id, 3), (product.Id, 3)));

        Assert.NotNull(error);
        Assert.Equal(5, _db.StockOf(product.Id));
    }

    [Fact]
    public async Task CreateOrder_WalkIn_IgnoresDeliveryCharge()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5, price: 100m);
        var model = Order((product.Id, 1));
        model.OrderType = "offline";
        model.DeliveryCharge = 60m;

        await CreateService().CreateOrderAsync(store.Id, model);

        using var ctx = _db.CreateContext();
        var order = await ctx.Orders.SingleAsync();
        Assert.Equal(0m, order.DeliveryCharge);
        Assert.Equal(100m, order.Total);
    }

    [Fact]
    public async Task CreateOrder_Online_AddsDeliveryCharge()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5, price: 100m);
        var model = Order((product.Id, 1));
        model.OrderType = "online";
        model.DeliveryCharge = 60m;

        await CreateService().CreateOrderAsync(store.Id, model);

        using var ctx = _db.CreateContext();
        var order = await ctx.Orders.SingleAsync();
        Assert.Equal(160m, order.Total);
        Assert.Equal("pending", order.Status);
    }

    [Fact]
    public async Task CreateOrder_RejectsDiscountLargerThanTotal()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5, price: 100m);
        var model = Order((product.Id, 1));
        model.Discount = 500m;

        var error = await CreateService().CreateOrderAsync(store.Id, model);

        Assert.Equal("Discount cannot exceed the order total.", error);
        Assert.Equal(5, _db.StockOf(product.Id));
    }

    [Fact]
    public async Task CreateOrder_CannotSellAnotherStoresProduct()
    {
        var myStore = _db.AddStore("Mine");
        var otherStore = _db.AddStore("Other");
        var otherProduct = _db.AddProduct(otherStore.Id, stock: 5);

        var error = await CreateService().CreateOrderAsync(myStore.Id, Order((otherProduct.Id, 1)));

        Assert.Equal("Product not found in your store.", error);
        Assert.Equal(5, _db.StockOf(otherProduct.Id));
    }

    [Fact]
    public async Task CreateOrder_UpdatesCustomerTotals()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5, price: 100m);
        var customer = _db.AddCustomer(store.Id);
        var model = Order((product.Id, 2));
        model.CustomerId = customer.Id;

        await CreateService().CreateOrderAsync(store.Id, model);

        using var ctx = _db.CreateContext();
        var updated = await ctx.Customers.SingleAsync();
        Assert.Equal(1, updated.TotalOrders);
        Assert.Equal(200m, updated.TotalSpent);
    }

    [Fact]
    public async Task CancelOrder_RestoresStock_AndCustomerTotals()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5, price: 100m);
        var customer = _db.AddCustomer(store.Id);
        var model = Order((product.Id, 2));
        model.CustomerId = customer.Id;
        model.OrderType = "online";   // starts as pending, so it can be cancelled
        await CreateService().CreateOrderAsync(store.Id, model);
        Guid orderId;
        using (var ctx = _db.CreateContext())
            orderId = (await ctx.Orders.SingleAsync()).Id;

        var error = await CreateService().ChangeOrderStatusAsync(orderId, store.Id, "cancelled");

        Assert.Null(error);
        Assert.Equal(5, _db.StockOf(product.Id));
        using var check = _db.CreateContext();
        var updated = await check.Customers.SingleAsync();
        Assert.Equal(0, updated.TotalOrders);
        Assert.Equal(0m, updated.TotalSpent);
    }

    [Fact]
    public async Task ReactivatingCancelledOrder_FailsWhenStockIsGone()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 2);
        var online = Order((product.Id, 2));
        online.OrderType = "online";
        await CreateService().CreateOrderAsync(store.Id, online);
        Guid orderId;
        using (var ctx = _db.CreateContext())
            orderId = (await ctx.Orders.SingleAsync()).Id;
        Assert.Null(await CreateService().ChangeOrderStatusAsync(orderId, store.Id, "cancelled"));
        Assert.Equal(2, _db.StockOf(product.Id));
        await CreateService().CreateOrderAsync(store.Id, Order((product.Id, 2)));  // sells the restored stock

        var error = await CreateService().ChangeOrderStatusAsync(orderId, store.Id, "pending");  // re-open

        Assert.NotNull(error);
        Assert.Equal(0, _db.StockOf(product.Id));
    }

    [Theory]
    [InlineData("shipped-to-mars")]
    [InlineData("pending")]      // a completed walk-in sale can't go back to pending
    [InlineData("cancelled")]    // completed sales are returned, not cancelled
    public async Task ChangeStatus_RejectsTransitionsTheStateMachineDoesNotAllow(string target)
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5);
        await CreateService().CreateOrderAsync(store.Id, Order((product.Id, 1)));   // walk-in → completed
        Guid orderId;
        using (var ctx = _db.CreateContext())
            orderId = (await ctx.Orders.SingleAsync()).Id;

        var error = await CreateService().ChangeOrderStatusAsync(orderId, store.Id, target);

        Assert.NotNull(error);
        Assert.Equal(4, _db.StockOf(product.Id));
    }

    [Fact]
    public async Task CreateOrder_WithSameIdempotencyKeyTwice_CreatesOneOrder()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5);
        var key = Guid.NewGuid();

        var first = Order((product.Id, 2));
        first.IdempotencyKey = key;
        var resubmit = Order((product.Id, 2));
        resubmit.IdempotencyKey = key;

        Assert.Null(await CreateService().CreateOrderAsync(store.Id, first));
        Assert.Null(await CreateService().CreateOrderAsync(store.Id, resubmit));   // reported as success

        Assert.Equal(3, _db.StockOf(product.Id));
        using var ctx = _db.CreateContext();
        Assert.Single(ctx.Orders);
    }

    [Fact]
    public async Task CreateOrder_NewCustomerWithKnownPhone_ReusesTheExistingCustomer()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5, price: 100m);
        using (var ctx = _db.CreateContext())
        {
            ctx.Customers.Add(new SellWise.Web.Models.Customer { StoreId = store.Id, Name = "Rahim", Phone = "01711000000" });
            await ctx.SaveChangesAsync();
        }
        var model = Order((product.Id, 1));
        model.NewCustomerName = "Rahim Uddin";
        model.NewCustomerPhone = " 01711000000 ";

        await CreateService().CreateOrderAsync(store.Id, model);

        using var check = _db.CreateContext();
        var customer = await check.Customers.SingleAsync();
        Assert.Equal(1, customer.TotalOrders);
        Assert.Equal(100m, customer.TotalSpent);
    }
}
