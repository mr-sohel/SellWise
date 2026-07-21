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

    public async Task<IActionResult> Index(string range = "30d")
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return RedirectToAction("Login", "Auth");

        // Fast check to avoid spinning up background tasks unnecessarily
        bool isSeeded = Db.Products.Any(p => p.StoreId == storeId);
        if (!isSeeded && User.Identity?.Name == "admin@sellwise.com")
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

        var vm = await _analytics.GetOverview(storeId, range);
        return View(vm);
    }

}
