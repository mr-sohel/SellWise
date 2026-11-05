using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Services;
using SellWise.Web.ViewModels.Alert;

namespace SellWise.Web.Controllers;

[OwnerOnly]
public class AlertController : BaseController
{
    private readonly IAlertService _alertService;

    public AlertController(AppDbContext db, IAlertService alertService) : base(db)
    {
        _alertService = alertService;
    }

    public async Task<IActionResult> Index(bool showUnreadOnly = false)
    {
        // Alerts are derived from current stock levels, so refresh them on every visit.
        await _alertService.ScanAndGenerateAlertsAsync(StoreId);

        var query = Db.Alerts.Where(a => a.StoreId == StoreId && a.Type == AlertService.LowStockType);
        if (showUnreadOnly)
            query = query.Where(a => !a.IsRead);

        var alerts = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AlertViewModel
            {
                Id = a.Id,
                ProductId = a.ProductId,
                ProductName = a.Product.Name,
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
    public async Task<IActionResult> MarkAllRead()
    {
        await Db.Alerts
            .Where(a => a.StoreId == StoreId && !a.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsRead, true));

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        await Db.Alerts
            .Where(a => a.Id == id && a.StoreId == StoreId)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsRead, true));

        return RedirectToAction(nameof(Index));
    }
}
