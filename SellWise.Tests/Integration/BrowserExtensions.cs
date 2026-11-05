using System.Net;
using System.Text.RegularExpressions;

namespace SellWise.Tests.Integration;

/// <summary>Helpers that drive the app like a browser: real forms, cookies and anti-forgery tokens.</summary>
public static partial class BrowserExtensions
{
    [GeneratedRegex("""name="__RequestVerificationToken"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name="__RequestVerificationToken" """)]
    private static partial Regex TokenRegex();

    /// <summary>Loads a page and returns the anti-forgery token from its first form.</summary>
    public static async Task<string> GetTokenAsync(this HttpClient client, string pageUrl)
    {
        var html = await client.GetStringAsync(pageUrl);
        var match = TokenRegex().Match(html);
        Assert.True(match.Success, $"No anti-forgery token found on {pageUrl}");
        return match.Groups[1].Success ? match.Groups[1].Value : match.Groups[2].Value;
    }

    public static async Task<HttpResponseMessage> PostFormAsync(
        this HttpClient client, string url, string tokenPageUrl, Dictionary<string, string>? fields = null)
    {
        var form = new Dictionary<string, string>(fields ?? new())
        {
            ["__RequestVerificationToken"] = await client.GetTokenAsync(tokenPageUrl)
        };
        return await client.PostAsync(url, new FormUrlEncodedContent(form));
    }

    public static async Task LoginAsync(this HttpClient client, string email, string password = SellWiseAppFactory.Password)
    {
        var response = await client.PostFormAsync("/Auth/Login", "/Auth/Login",
            new() { ["Email"] = email, ["Password"] = password });

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
    }

    public static string RedirectPath(this HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        var location = response.Headers.Location!;
        return location.IsAbsoluteUri ? location.PathAndQuery : location.OriginalString;
    }
}
