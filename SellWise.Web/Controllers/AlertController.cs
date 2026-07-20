using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Alert;
using SellWise.Web.Services;
using System.Linq;
using System.Threading.Tasks;

namespace SellWise.Web.Controllers;

[Authorize]
public class AlertController : BaseController
{
    private readonly IAlertService _alertService;

    public AlertController(AppDbContext db, IAlertService alertService) : base(db)
    {
        _alertService = alertService;
    }

    public async Task<IActionResult> Index(bool showUnreadOnly = false)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");

        var query = Db.Alerts.Where(a => a.StoreId == storeId);

        if (showUnreadOnly)
        {
            query = query.Where(a => !a.IsRead);
        }

        var alerts = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AlertViewModel
            {
                Id = a.Id,
                ProductId = a.ProductId,
                ProductName = a.Product != null ? a.Product.Name : "Unknown",
                Type = a.Type,
                Message = a.Message,
                Severity = a.Severity,
                IsRead = a.IsRead,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        ViewData["ShowUnreadOnly"] = showUnreadOnly;
        return View(alerts);
    }

    [HttpPost]
    public async Task<IActionResult> ScanInventory()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");

        await _alertService.ScanAndGenerateAlertsAsync(storeId);
        TempData["SuccessMessage"] = "Inventory scan completed. Alerts generated for low stock items.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> MarkAllRead()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");

        var unread = await Db.Alerts.Where(a => a.StoreId == storeId && !a.IsRead).ToListAsync();
        foreach (var a in unread)
        {
            a.IsRead = true;
        }
        await Db.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Dismiss(System.Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");

        var alert = await Db.Alerts.FirstOrDefaultAsync(a => a.Id == id && a.StoreId == storeId);
        if (alert != null)
        {
            Db.Alerts.Remove(alert);
            await Db.SaveChangesAsync();
        }
        return RedirectToAction(nameof(Index));
    }
}
