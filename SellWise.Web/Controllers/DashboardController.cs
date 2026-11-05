using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Infrastructure;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[OwnerOnly]
[EnableRateLimiting(RateLimiting.ExpensivePolicy)]
public class DashboardController : BaseController
{
    private static readonly string[] Ranges = { "7d", "15d", "30d", "90d", "1y" };
    private readonly AnalyticsService _analytics;

    public DashboardController(AppDbContext db, AnalyticsService analytics) : base(db)
    {
        _analytics = analytics;
    }

    public async Task<IActionResult> Index(string range = "30d")
    {
        range = NormalizeRange(range);
        var vm = await _analytics.GetOverview(StoreId, range);
        ViewData["Range"] = range;
        return View(vm);
    }

    /// <summary>The range ends up in inline JavaScript in the views, so only known values are allowed.</summary>
    private static string NormalizeRange(string? range) => Ranges.Contains(range) ? range! : "30d";
}
