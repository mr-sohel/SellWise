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
        // 1. Remove alerts for products that are healthy (StockQuantity > LowStockThreshold), inactive, or legacy resolved
        var healthyOrInactiveProductIds = await _db.Products
            .Where(p => p.StoreId == storeId && (!p.IsActive || p.StockQuantity > p.LowStockThreshold))
            .Select(p => p.Id)
            .ToListAsync();

        var alertsToRemove = await _db.Alerts
            .Where(a => a.StoreId == storeId && (healthyOrInactiveProductIds.Contains(a.ProductId) || a.Type.Contains("Resolved")))
            .ToListAsync();

        bool hasChanges = alertsToRemove.Any();
        if (alertsToRemove.Any())
        {
            _db.Alerts.RemoveRange(alertsToRemove);
        }

        // 2. Find active products at or below their low stock threshold
        var lowStockProducts = await _db.Products
            .Where(p => p.StoreId == storeId && p.IsActive && p.StockQuantity <= p.LowStockThreshold)
            .ToListAsync();

        var existingAlerts = await _db.Alerts
            .Where(a => a.StoreId == storeId && a.Type == "Low Stock")
            .ToListAsync();

        var existingAlertProductIds = existingAlerts.Select(a => a.ProductId).ToHashSet();

        foreach (var product in lowStockProducts)
        {
            var expectedMsg = product.StockQuantity == 0
                ? $"Out of stock. Currently at zero units — threshold is {product.LowStockThreshold}."
                : $"Only {product.StockQuantity} unit{(product.StockQuantity == 1 ? "" : "s")} left — threshold is {product.LowStockThreshold}.";
            var expectedSeverity = product.StockQuantity == 0 ? "Critical" : "Warning";

            if (existingAlertProductIds.Contains(product.Id))
            {
                var existing = existingAlerts.First(a => a.ProductId == product.Id);
                if (existing.Message != expectedMsg || existing.Severity != expectedSeverity)
                {
                    existing.Message = expectedMsg;
                    existing.Severity = expectedSeverity;
                    hasChanges = true;
                }
                continue;
            }

            var alert = new InventoryAlert
            {
                StoreId = storeId,
                ProductId = product.Id,
                Type = "Low Stock",
                Message = expectedMsg,
                Severity = expectedSeverity,
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
