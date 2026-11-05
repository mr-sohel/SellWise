using System.Globalization;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace SellWise.Web.Infrastructure;

/// <summary>
/// Request rate limits, using ASP.NET Core's built-in rate limiter.
///
/// - Global: every user (or IP, when signed out) gets a token bucket, which allows short bursts
///   but caps sustained traffic. Protects the app from scripts and runaway clients.
/// - "auth": login/signup POSTs per IP. Account lockout already stops guessing one account's
///   password; this also stops one IP from trying passwords against many accounts.
/// - "expensive": dashboard pages per user, because they run several aggregate queries.
///
/// Behind Caddy the client IP comes from X-Forwarded-For (UseForwardedHeaders runs first).
/// </summary>
public static class RateLimiting
{
    public const string AuthPolicy = "auth";
    public const string ExpensivePolicy = "expensive";

    public static IServiceCollection AddSellWiseRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var limits = configuration.GetSection("RateLimiting").Get<RateLimitOptions>() ?? new RateLimitOptions();

        return services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter =
                        ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture);
                }
                await context.HttpContext.Response.WriteAsync("Too many requests. Please wait a moment and try again.", cancellationToken);
            };

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetTokenBucketLimiter(UserOrIp(context), _ => new TokenBucketRateLimiterOptions
                {
                    TokenLimit = limits.GlobalBurst,
                    TokensPerPeriod = limits.GlobalPerTenSeconds,
                    ReplenishmentPeriod = TimeSpan.FromSeconds(10),
                    QueueLimit = 0
                }));

            options.AddPolicy(AuthPolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(ClientIp(context), _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.AuthPerMinute,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                }));

            options.AddPolicy(ExpensivePolicy, context =>
                RateLimitPartition.GetSlidingWindowLimiter(UserOrIp(context), _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = limits.ExpensivePerMinute,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 6,
                    QueueLimit = 0
                }));
        });
    }

    private static string UserOrIp(HttpContext context) =>
        context.User.FindFirstValue(ClaimTypes.NameIdentifier) is { } userId
            ? "user:" + userId
            : ClientIp(context);

    private static string ClientIp(HttpContext context) =>
        "ip:" + (context.Connection.RemoteIpAddress?.ToString() ?? "unknown");
}

/// <summary>Bound from the "RateLimiting" configuration section; defaults suit a small shop.</summary>
public class RateLimitOptions
{
    public int GlobalBurst { get; set; } = 100;
    public int GlobalPerTenSeconds { get; set; } = 50;
    public int AuthPerMinute { get; set; } = 10;
    public int ExpensivePerMinute { get; set; } = 30;
}
