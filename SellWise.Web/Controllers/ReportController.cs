using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Report;
using System.Linq;
using System.Threading.Tasks;

namespace SellWise.Web.Controllers;

[Authorize]
public class ReportController : BaseController
{
    public ReportController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");

        var totalOrders = await Db.Orders.Where(o => o.StoreId == storeId).CountAsync();
        var totalRevenue = await Db.Orders.Where(o => o.StoreId == storeId).SumAsync(o => o.Total);

        var vm = new ReportViewModel
        {
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue
        };

        return View(vm);
    }
}
