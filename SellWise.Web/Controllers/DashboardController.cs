using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using SellWise.Web.Data;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
public class DashboardController : BaseController
{
    private readonly AnalyticsService _analytics;
    private readonly IServiceScopeFactory _scopeFactory;

    public DashboardController(AppDbContext db, AnalyticsService analytics, IServiceScopeFactory scopeFactory) : base(db)
    {
        _analytics = analytics;
        _scopeFactory = scopeFactory;
    }

    public async Task<IActionResult> Index(string range = "30d", int page = 1)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return RedirectToAction("Login", "Auth");

        // Fast check to avoid spinning up background tasks unnecessarily
        bool isSeeded = Db.Products.Any(p => p.StoreId == storeId);
        var storeName = Db.Stores.Where(s => s.Id == storeId).Select(s => s.Name).FirstOrDefault() ?? "";
        bool isDemoStore = storeName == "SellWise Tech BD" || storeName == "StyleHub BD";
        if (!isSeeded && isDemoStore && User.Identity?.Name == "admin@sellwise.com")
        {
            // Auto-seed demo data in the background so dashboard doesn't block for 15s
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var backgroundSeeder = scope.ServiceProvider.GetRequiredService<DemoSeederService>();
                await backgroundSeeder.SeedStoreAsync(storeId);
            });
            ViewData["SeedingInProgress"] = true;
        }

        const int pageSize = 8;
        page = Math.Max(1, page);
        var vm = await _analytics.GetOverview(storeId, range, page, pageSize);
        int totalPages = Math.Max(1, (int)Math.Ceiling(vm.TotalForecastProducts / (double)pageSize));
        ViewData["ForecastPage"] = page > totalPages ? totalPages : page;
        ViewData["ForecastTotalPages"] = totalPages;
        return View(vm);
    }

    [HttpGet]
    public async Task<IActionResult> ForecastGrid(string range = "30d", int page = 1)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return Unauthorized();

        const int pageSize = 8;
        page = Math.Max(1, page);
        var vm = await _analytics.GetForecastsPageAsync(storeId, range, page, pageSize);
        return PartialView("_ForecastGrid", vm);
    }
}
