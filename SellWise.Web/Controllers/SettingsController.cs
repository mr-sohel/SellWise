using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;

namespace SellWise.Web.Controllers;

[Authorize]
public class SettingsController : BaseController
{
    public SettingsController(AppDbContext db) : base(db) { }

    public IActionResult Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        
        return View();
    }
}
