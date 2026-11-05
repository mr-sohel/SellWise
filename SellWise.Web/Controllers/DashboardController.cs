using Microsoft.AspNetCore.Mvc;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[OwnerOnly]
public class DashboardController : BaseController
{
    private const int ForecastPageSize = 8;
    private readonly AnalyticsService _analytics;

    public DashboardController(AppDbContext db, AnalyticsService analytics) : base(db)
    {
        _analytics = analytics;
    }

    public async Task<IActionResult> Index(string range = "30d", int page = 1)
    {
        page = Math.Max(1, page);
        var vm = await _analytics.GetOverview(StoreId, range, page, ForecastPageSize);
        int totalPages = Math.Max(1, (int)Math.Ceiling(vm.TotalForecastProducts / (double)ForecastPageSize));
        ViewData["ForecastPage"] = Math.Min(page, totalPages);
        ViewData["ForecastTotalPages"] = totalPages;
        return View(vm);
    }

    [HttpGet]
    public async Task<IActionResult> ForecastGrid(string range = "30d", int page = 1)
    {
        page = Math.Max(1, page);
        var vm = await _analytics.GetForecastsPageAsync(StoreId, range, page, ForecastPageSize);
        return PartialView("_ForecastGrid", vm);
    }
}
