using System.Net;

namespace SellWise.Tests.Integration;

/// <summary>
/// The owner of Store A tries to read and change Store B's data by guessing ids
/// (an IDOR attack). Every attempt must fail and leave Store B's data untouched.
/// </summary>
[Collection(WebAppCollection.Name)]
public class TenantIsolationTests
{
    private readonly SellWiseAppFactory _app;

    public TenantIsolationTests(SellWiseAppFactory app) => _app = app;

    private async Task<HttpClient> OwnerOfStoreAAsync()
    {
        var client = _app.CreateBrowser();
        await client.LoginAsync(SellWiseAppFactory.OwnerA);
        return client;
    }

    [Theory]
    [InlineData("/Order/Details/{0}")]
    [InlineData("/Order/Invoice/{0}")]
    public async Task CannotViewAnotherStoresOrder(string urlTemplate)
    {
        var client = await OwnerOfStoreAAsync();

        var response = await client.GetAsync(string.Format(urlTemplate, _app.StoreBOrderId));

        Assert.Equal("/Order", response.RedirectPath());
    }

    [Fact]
    public async Task CannotEditAnotherStoresProduct()
    {
        var client = await OwnerOfStoreAAsync();

        var response = await client.GetAsync($"/Product/Edit/{_app.StoreBProductId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CannotEditAnotherStoresCustomer()
    {
        var client = await OwnerOfStoreAAsync();

        var response = await client.GetAsync($"/Customer/Edit/{_app.StoreBCustomerId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CannotRestockAnotherStoresProduct()
    {
        var client = await OwnerOfStoreAAsync();

        var response = await client.PostFormAsync("/Product/Restock", "/Product", new()
        {
            ["productId"] = _app.StoreBProductId.ToString(),
            ["quantity"] = "50"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(10, _app.Query(db => db.Products.Single(p => p.Id == _app.StoreBProductId).StockQuantity));
    }

    [Fact]
    public async Task CannotCancelAnotherStoresOrder()
    {
        var client = await OwnerOfStoreAAsync();

        await client.PostFormAsync($"/Order/Cancel/{_app.StoreBOrderId}", "/Order");

        Assert.Equal("pending", _app.Query(db => db.Orders.Single(o => o.Id == _app.StoreBOrderId).Status));
    }

    [Fact]
    public async Task CannotSwitchIntoAStoreTheUserIsNotAMemberOf()
    {
        var client = await OwnerOfStoreAAsync();

        await client.PostFormAsync("/Auth/SwitchStore", "/Product", new()
        {
            ["storeId"] = _app.StoreBId.ToString(),
            ["returnUrl"] = "/Product"
        });
        var products = await client.GetStringAsync("/Product");

        Assert.Contains("A-Product", products);
        Assert.DoesNotContain("B-Secret-Product", products);
    }

    [Fact]
    public async Task ListsOnlyShowTheActiveStoresData()
    {
        var client = await OwnerOfStoreAAsync();

        Assert.DoesNotContain("ORD-B-SECRET", await client.GetStringAsync("/Order"));
        Assert.DoesNotContain("B-Secret-Customer", await client.GetStringAsync("/Customer"));
        Assert.DoesNotContain("B-Secret-Product", await client.GetStringAsync("/Product"));
    }
}
