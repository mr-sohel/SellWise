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

    public async Task GenerateMockAlertsIfNeededAsync(Guid storeId)
    {
        var hasAlerts = await _db.Alerts.AnyAsync(a => a.StoreId == storeId);
        if (hasAlerts) return;

        var lowStockProducts = await _db.Products
            .Where(p => p.StoreId == storeId && p.StockQuantity <= p.LowStockThreshold)
            .Take(6)
            .ToListAsync();

        foreach (var product in lowStockProducts)
        {
            var alert = new InventoryAlert
            {
                StoreId = storeId,
                ProductId = product.Id,
                Type = "Low Stock",
                Message = $"{product.Name} — current stock: {product.StockQuantity}, predicted demand: {product.StockQuantity * 2 + 15} in 30 days. Restock recommended: {Math.Max(50, (product.LowStockThreshold * 2) - product.StockQuantity)} units",
                Severity = "Warning",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30)
            };
            _db.Alerts.Add(alert);
        }
        await _db.SaveChangesAsync();
    }
}
