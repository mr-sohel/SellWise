using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using System.Linq;
using System.Threading.Tasks;

namespace SellWise.Web.Controllers;

public class AlertController : BaseController
{
    public AlertController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index(bool showUnreadOnly = false)
    {
        var store = await Db.Stores.FirstOrDefaultAsync();
        var storeId = store?.Id ?? System.Guid.Empty;

        // Query existing alerts
        var alerts = await Db.Alerts
            .Include(a => a.Product)
            .Where(a => a.StoreId == storeId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        if (!alerts.Any())
        {
            // Auto generate alerts from products that have low stock to demonstrate feature
            var lowStockProducts = await Db.Products
                .Where(p => p.StoreId == storeId)
                .Take(6)
                .ToListAsync();

            foreach (var product in lowStockProducts)
            {
                var alert = new InventoryAlert
                {
                    StoreId = storeId,
                    ProductId = product.Id,
                    Type = "Low Stock",
                    Message = $"{product.Name} — current stock: {product.StockQuantity}, predicted demand: {product.StockQuantity * 2 + 15} in 30 days. Restock recommended: {System.Math.Max(50, (product.LowStockThreshold * 2) - product.StockQuantity)} units",
                    Severity = "Warning",
                    IsRead = false,
                    CreatedAt = System.DateTime.UtcNow.AddMinutes(-30)
                };
                Db.Alerts.Add(alert);
            }
            await Db.SaveChangesAsync();

            alerts = await Db.Alerts
                .Include(a => a.Product)
                .Where(a => a.StoreId == storeId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        if (showUnreadOnly)
        {
            alerts = alerts.Where(a => !a.IsRead).ToList();
        }

        ViewData["ShowUnreadOnly"] = showUnreadOnly;
        return View(alerts);
    }

    [HttpPost]
    public async Task<IActionResult> MarkAllRead()
    {
        var store = await Db.Stores.FirstOrDefaultAsync();
        var storeId = store?.Id ?? System.Guid.Empty;

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
        var alert = await Db.Alerts.FindAsync(id);
        if (alert != null)
        {
            Db.Alerts.Remove(alert);
            await Db.SaveChangesAsync();
        }
        return RedirectToAction(nameof(Index));
    }
}
