using SellWise.Web.Models;

namespace SellWise.Tests.Integration;

/// <summary>
/// Fires many requests at the same time against real SQL Server and checks that the totals
/// still add up. These are the races two cashiers (or a double-click) can cause in a shop.
/// </summary>
[Collection(WebAppCollection.Name)]
public class ConcurrencyTests
{
    private const int Parallel = 12;
    private readonly SellWiseAppFactory _app;

    public ConcurrencyTests(SellWiseAppFactory app) => _app = app;

    private async Task<(HttpClient Client, string Token)> OwnerAsync()
    {
        var client = _app.CreateBrowser();
        await client.LoginAsync(SellWiseAppFactory.OwnerA);
        return (client, await client.GetTokenAsync("/Order/Create"));
    }

    private static Task<HttpResponseMessage> Checkout(HttpClient client, string token, Guid productId, Guid idempotencyKey,
        Guid? customerId = null) =>
        client.PostAsync("/Order/Create", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["__RequestVerificationToken"] = token,
            ["IdempotencyKey"] = idempotencyKey.ToString(),
            ["CustomerId"] = customerId?.ToString() ?? "",
            ["OrderType"] = "offline",
            ["Items[0].ProductId"] = productId.ToString(),
            ["Items[0].Quantity"] = "1"
        }));

    private Product NewProduct(int stock) => new()
    {
        StoreId = _app.StoreAId, Name = $"Race-{Guid.NewGuid():N}", SellingPrice = 100, CostPrice = 50, StockQuantity = stock
    };

    [Fact]
    public async Task ParallelCheckouts_NeverSellMoreThanTheStock()
    {
        var product = NewProduct(stock: 5);
        await _app.SeedAsync(product);
        var (client, token) = await OwnerAsync();

        // 12 cashiers try to sell the last 5 units at the same moment.
        await Task.WhenAll(Enumerable.Range(0, Parallel).Select(_ => Checkout(client, token, product.Id, Guid.NewGuid())));

        Assert.Equal(0, _app.Query(db => db.Products.Single(p => p.Id == product.Id).StockQuantity));
        Assert.Equal(5, _app.Query(db => db.OrderItems.Count(i => i.ProductId == product.Id)));
    }

    [Fact]
    public async Task RepeatedSubmitsOfTheSameCheckout_CreateOneOrder()
    {
        var product = NewProduct(stock: 50);
        await _app.SeedAsync(product);
        var (client, token) = await OwnerAsync();
        var key = Guid.NewGuid();

        // Double-clicks / network retries: the same form (same idempotency key) arrives 12 times at once.
        var responses = await Task.WhenAll(Enumerable.Range(0, Parallel).Select(_ => Checkout(client, token, product.Id, key)));

        Assert.All(responses, r => Assert.Equal("/Order", r.RedirectPath()));   // every retry sees "success"
        Assert.Equal(1, _app.Query(db => db.Orders.Count(o => o.IdempotencyKey == key)));
        Assert.Equal(49, _app.Query(db => db.Products.Single(p => p.Id == product.Id).StockQuantity));
    }

    [Fact]
    public async Task ParallelOrdersForOneCustomer_AreAllCounted()
    {
        // Each order is for a different product. (With one shared product, the stock row lock
        // would make the checkouts run one at a time and hide the race on the customer row.)
        var products = Enumerable.Range(0, Parallel).Select(_ => NewProduct(stock: 5)).ToArray();
        var customer = new Customer { StoreId = _app.StoreAId, Name = "Busy Customer" };
        await _app.SeedAsync([.. products, customer]);
        var (client, token) = await OwnerAsync();

        await Task.WhenAll(products.Select(p => Checkout(client, token, p.Id, Guid.NewGuid(), customer.Id)));

        var saved = _app.Query(db => db.Customers.Single(c => c.Id == customer.Id));
        Assert.Equal(Parallel, saved.TotalOrders);
        Assert.Equal(Parallel * 100m, saved.TotalSpent);
    }

    [Fact]
    public async Task ParallelCancelsOfOneOrder_RestoreStockOnce()
    {
        // An online order for 2 units that has already taken stock (10 → 8).
        var product = NewProduct(stock: 8);
        var order = new Order
        {
            StoreId = _app.StoreAId, OrderNumber = $"ORD-RACE-{Guid.NewGuid():N}"[..30], Status = OrderStatus.Pending,
            OrderType = "online", Total = 200,
            Items = { new OrderItem { ProductId = product.Id, ProductName = product.Name, UnitPrice = 100, CostPrice = 50, Quantity = 2 } }
        };
        await _app.SeedAsync(product, order);
        var (client, token) = await OwnerAsync();

        await Task.WhenAll(Enumerable.Range(0, Parallel).Select(_ =>
            client.PostAsync($"/Order/Cancel/{order.Id}", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["__RequestVerificationToken"] = token
            }))));

        Assert.Equal(10, _app.Query(db => db.Products.Single(p => p.Id == product.Id).StockQuantity));
        Assert.Equal(OrderStatus.Cancelled, _app.Query(db => db.Orders.Single(o => o.Id == order.Id).Status));
    }
}
