using System.Net;
using Microsoft.AspNetCore.Hosting;

namespace SellWise.Tests.Integration;

/// <summary>Runs separate app instances with small limits so the limits are easy to hit.</summary>
[Collection(WebAppCollection.Name)]
public class RateLimitingTests
{
    private readonly SellWiseAppFactory _app;

    public RateLimitingTests(SellWiseAppFactory app) => _app = app;

    [Fact]
    public async Task LoginAttempts_AreLimitedPerIp_AcrossDifferentAccounts()
    {
        await using var app = _app.WithWebHostBuilder(b => b.UseSetting("RateLimiting:AuthPerMinute", "3"));
        var client = app.CreateClient(new() { AllowAutoRedirect = false });

        // Password spraying: one IP tries a different account each time, so account lockout never triggers.
        var statuses = new List<HttpStatusCode>();
        foreach (var email in new[] { "a@x.com", "b@x.com", "c@x.com", "d@x.com" })
        {
            var response = await client.PostFormAsync("/Auth/Login", "/Auth/Login",
                new() { ["Email"] = email, ["Password"] = "wrong-password" });
            statuses.Add(response.StatusCode);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
                Assert.True(response.Headers.RetryAfter is not null, "429 should tell the client when to retry");
        }

        Assert.Equal(new[] { HttpStatusCode.OK, HttpStatusCode.OK, HttpStatusCode.OK, HttpStatusCode.TooManyRequests }, statuses);
    }

    [Fact]
    public async Task BurstsOfRequests_AreLimitedPerUser()
    {
        await using var app = _app.WithWebHostBuilder(b =>
        {
            b.UseSetting("RateLimiting:GlobalBurst", "20");
            b.UseSetting("RateLimiting:GlobalPerTenSeconds", "1");
        });
        var client = app.CreateClient(new() { AllowAutoRedirect = false });
        await client.LoginAsync(SellWiseAppFactory.StaffA);

        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 25; i++)
            statuses.Add((await client.GetAsync("/Order")).StatusCode);

        Assert.Contains(HttpStatusCode.TooManyRequests, statuses);
        Assert.Equal(HttpStatusCode.OK, statuses[0]);
    }
}
