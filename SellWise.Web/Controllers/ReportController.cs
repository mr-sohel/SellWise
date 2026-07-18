using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using System.Linq;
using System.Threading.Tasks;

namespace SellWise.Web.Controllers;

public class ReportController : BaseController
{
    public ReportController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index()
    {
        var store = await Db.Stores.FirstOrDefaultAsync();
        var storeId = store?.Id ?? System.Guid.Empty;

        // Calculate count and total revenue matching store context
        var totalOrders = await Db.Orders.Where(o => o.StoreId == storeId).CountAsync();
        var totalRevenue = await Db.Orders.Where(o => o.StoreId == storeId).SumAsync(o => o.Total);

        ViewData["TotalOrders"] = totalOrders;
        ViewData["TotalRevenue"] = totalRevenue;

        return View();
    }
}
