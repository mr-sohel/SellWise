using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

[Authorize]
public class CustomerController : BaseController
{
    public CustomerController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var customers = await Db.Customers
            .Where(c => c.StoreId == storeId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
            
        return View(customers);
    }
}
