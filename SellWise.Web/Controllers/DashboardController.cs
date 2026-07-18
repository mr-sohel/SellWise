using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
public class DashboardController : BaseController
{
    private readonly AnalyticsService _analytics;
    private readonly DemoSeederService _seeder;

    public DashboardController(AppDbContext db, AnalyticsService analytics, DemoSeederService seeder) : base(db)
    {
        _analytics = analytics;
        _seeder = seeder;
    }

    public async Task<IActionResult> Index(string range = "30d")
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return RedirectToAction("Login", "Auth");

        // Auto-seed demo data on first visit
        await _seeder.SeedStoreAsync(storeId);

        var vm = await _analytics.GetOverview(storeId, range);
        return View(vm);
    }

}
