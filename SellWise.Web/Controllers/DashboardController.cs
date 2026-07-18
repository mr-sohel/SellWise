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

    public DashboardController(AppDbContext db, AnalyticsService analytics) : base(db)
    {
        _analytics = analytics;
    }

    public async Task<IActionResult> Index(string range = "30d")
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return RedirectToAction("Login", "Auth");

        var vm = await _analytics.GetOverview(storeId, range);
        return View(vm);
    }

}
