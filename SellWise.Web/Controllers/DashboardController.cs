using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SellWise.Web.Data;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
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
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return RedirectToAction("Login", "Auth");

        if (await IsEmployeeAsync(storeId))
            return RedirectToAction("Index", "Order");

        page = Math.Max(1, page);
        var vm = await _analytics.GetOverview(storeId, range, page, ForecastPageSize);
        int totalPages = Math.Max(1, (int)Math.Ceiling(vm.TotalForecastProducts / (double)ForecastPageSize));
        ViewData["ForecastPage"] = Math.Min(page, totalPages);
        ViewData["ForecastTotalPages"] = totalPages;
        return View(vm);
    }

    [HttpGet]
    public async Task<IActionResult> ForecastGrid(string range = "30d", int page = 1)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return Unauthorized();

        if (await IsEmployeeAsync(storeId))
            return Forbid();

        page = Math.Max(1, page);
        var vm = await _analytics.GetForecastsPageAsync(storeId, range, page, ForecastPageSize);
        return PartialView("_ForecastGrid", vm);
    }
}
