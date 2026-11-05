using System.Net;

namespace SellWise.Tests.Integration;

[Collection(WebAppCollection.Name)]
public class AuthorizationTests
{
    private readonly SellWiseAppFactory _app;

    public AuthorizationTests(SellWiseAppFactory app) => _app = app;

    private async Task<HttpClient> LoggedInAsync(string email)
    {
        var client = _app.CreateBrowser();
        await client.LoginAsync(email);
        return client;
    }

    [Theory]
    [InlineData("/Order")]
    [InlineData("/Dashboard")]
    [InlineData("/Product")]
    public async Task AnonymousUsers_AreSentToLogin(string url)
    {
        var response = await _app.CreateBrowser().GetAsync(url);

        Assert.StartsWith("/Auth/Login", response.RedirectPath());
    }

    [Theory]
    [InlineData("/Dashboard")]
    [InlineData("/Report")]
    [InlineData("/Alert")]
    [InlineData("/Settings/Staff")]
    [InlineData("/Product/Create")]
    public async Task Staff_CannotOpenOwnerPages(string url)
    {
        var staff = await LoggedInAsync(SellWiseAppFactory.StaffA);

        var response = await staff.GetAsync(url);

        Assert.Equal("/Order", response.RedirectPath());
    }

    [Theory]
    [InlineData("/Order")]
    [InlineData("/Order/Create")]
    [InlineData("/Customer")]
    [InlineData("/Product")]
    public async Task Staff_CanUseFrontOfHousePages(string url)
    {
        var staff = await LoggedInAsync(SellWiseAppFactory.StaffA);

        var response = await staff.GetAsync(url);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Staff_RestockByAjax_IsForbidden()
    {
        var staff = await LoggedInAsync(SellWiseAppFactory.StaffA);
        var token = await staff.GetTokenAsync("/Product");

        var request = new HttpRequestMessage(HttpMethod.Post, "/Product/Restock")
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["productId"] = _app.StoreAProductId.ToString(),
                ["quantity"] = "5"
            })
        };
        request.Headers.Add("RequestVerificationToken", token);
        request.Headers.Add("X-Requested-With", "XMLHttpRequest");

        var response = await staff.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(10, _app.Query(db => db.Products.Single(p => p.Id == _app.StoreAProductId).StockQuantity));
    }

    [Fact]
    public async Task Owner_CanOpenOwnerPages()
    {
        var owner = await LoggedInAsync(SellWiseAppFactory.OwnerA);

        var dashboard = await owner.GetAsync("/Dashboard");

        Assert.Equal(HttpStatusCode.OK, dashboard.StatusCode);
        Assert.Contains("A-Product", await dashboard.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task PostsWithoutAnAntiForgeryToken_AreRejected()
    {
        var owner = await LoggedInAsync(SellWiseAppFactory.OwnerA);

        var response = await owner.PostAsync("/Product/Delete/" + _app.StoreAProductId,
            new FormUrlEncodedContent(new Dictionary<string, string>()));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(_app.Query(db => db.Products.Single(p => p.Id == _app.StoreAProductId).IsActive));
    }
}
