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
    private const int ForecastPageSize = 8;
    private static readonly string[] Ranges = { "7d", "15d", "30d", "90d", "1y" };
    private readonly AnalyticsService _analytics;

    public DashboardController(AppDbContext db, AnalyticsService analytics) : base(db)
    {
        _analytics = analytics;
    }

    public async Task<IActionResult> Index(string range = "30d", int page = 1)
    {
        range = NormalizeRange(range);
        page = Math.Max(1, page);
        var vm = await _analytics.GetOverview(StoreId, range, page, ForecastPageSize);
        int totalPages = Math.Max(1, (int)Math.Ceiling(vm.TotalForecastProducts / (double)ForecastPageSize));
        ViewData["ForecastPage"] = Math.Min(page, totalPages);
        ViewData["ForecastTotalPages"] = totalPages;
        ViewData["Range"] = range;
        return View(vm);
    }

    [HttpGet]
    public async Task<IActionResult> ForecastGrid(string range = "30d", int page = 1)
    {
        range = NormalizeRange(range);
        page = Math.Max(1, page);
        var vm = await _analytics.GetForecastsPageAsync(StoreId, range, page, ForecastPageSize);
        return PartialView("_ForecastGrid", vm);
    }

    /// <summary>The range ends up in inline JavaScript in the views, so only known values are allowed.</summary>
    private static string NormalizeRange(string? range) => Ranges.Contains(range) ? range! : "30d";
}
