using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Services;

public class AlertService : IAlertService
{
    private readonly AppDbContext _db;

    public AlertService(AppDbContext db)
    {
        _db = db;
    }

    public async Task ScanAndGenerateAlertsAsync(Guid storeId)
    {
        // Find products below or equal to their low stock threshold
        var lowStockProducts = await _db.Products
            .Where(p => p.StoreId == storeId && p.IsActive && p.StockQuantity <= p.LowStockThreshold)
            .ToListAsync();

        var healthyProductsIds = await _db.Products
            .Where(p => p.StoreId == storeId && p.IsActive && p.StockQuantity > p.LowStockThreshold)
            .Select(p => p.Id)
            .ToListAsync();

        var alertsToResolve = await _db.Alerts
            .Where(a => a.StoreId == storeId && a.Type == "Low Stock" && healthyProductsIds.Contains(a.ProductId))
            .ToListAsync();

        bool hasChanges = alertsToResolve.Any();

        foreach (var alert in alertsToResolve)
        {
            alert.Type = "Low Stock (Resolved)";
            alert.IsRead = true;
        }

        // Get existing unresolved alerts for these products to avoid duplicates
        // By checking Type == "Low Stock" (not checking IsRead), we ensure
        // we don't generate duplicates even if the user marks it as read.
        var existingAlertProductIds = await _db.Alerts
            .Where(a => a.StoreId == storeId && a.Type == "Low Stock")
            .Select(a => a.ProductId)
            .ToListAsync();

        foreach (var product in lowStockProducts)
        {
            if (existingAlertProductIds.Contains(product.Id))
                continue; // Already has an active alert

            var alert = new InventoryAlert
            {
                StoreId = storeId,
                ProductId = product.Id,
                Type = "Low Stock",
                Message = $"{product.Name} is running low — current stock: {product.StockQuantity}, threshold: {product.LowStockThreshold}. Consider restocking soon.",
                Severity = product.StockQuantity == 0 ? "Critical" : "Warning",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _db.Alerts.Add(alert);
            hasChanges = true;
        }

        if (hasChanges)
        {
            await _db.SaveChangesAsync();
        }
    }
}
