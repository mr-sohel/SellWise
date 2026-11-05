using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Dashboard;

namespace SellWise.Web.Services;

/// <summary>Builds the owner dashboard: sales KPIs, charts and product lists.</summary>
public class AnalyticsService
{
    private readonly AppDbContext _db;

    public AnalyticsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardViewModel> GetOverview(Guid storeId, string range)
    {
        var now = DateTime.UtcNow;
        var startDate = GetRangeStart(range, now);

        var sales = _db.Orders.Where(o => o.StoreId == storeId
            && o.Status != "cancelled" && o.Status != "returned"
            && o.OrderDate >= startDate);

        var totalRevenue = await sales.SumAsync(o => o.Total);
        var orderCount = await sales.CountAsync();

        var revenueTrend = (await sales
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.Total) })
                .OrderBy(g => g.Date)
                .ToListAsync())
            .Select(g => new RevenuePoint { Date = g.Date.ToString("MMM dd"), Revenue = g.Revenue })
            .ToList();

        var soldItems = _db.OrderItems.Where(oi => oi.Order.StoreId == storeId
            && oi.Order.Status != "cancelled" && oi.Order.Status != "returned"
            && oi.Order.OrderDate >= startDate);

        var itemRevenue = await soldItems.SumAsync(oi => oi.Quantity * oi.UnitPrice);

        var categorySales = (await soldItems
                .Where(oi => oi.Product != null)
                .GroupBy(oi => oi.Product!.Category)
                .Select(g => new { Category = g.Key, Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice) })
                .ToListAsync())
            .Select(g => new CategorySalesPoint
            {
                Category = string.IsNullOrEmpty(g.Category) ? "Other" : g.Category,
                Revenue = g.Revenue,
                Percentage = itemRevenue > 0 ? (double)Math.Round(g.Revenue / itemRevenue * 100, 1) : 0
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        var topPerformers = (await soldItems
                .GroupBy(oi => oi.ProductName)
                .Select(g => new { ProductName = g.Key, Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice) })
                .OrderByDescending(p => p.Revenue)
                .Take(50)
                .ToListAsync())
            .Select((p, idx) => new ProductPerformancePoint { ProductName = p.ProductName, Revenue = p.Revenue, Rank = idx + 1 })
            .ToList();

        var lowestStock = await _db.Products
            .Where(p => p.StoreId == storeId && p.IsActive)
            .OrderBy(p => p.StockQuantity)
            .Take(50)
            .Select(p => new { p.Id, p.Name, p.StockQuantity, p.LowStockThreshold, p.SellingPrice, p.Unit })
            .ToListAsync();

        var needsAttention = lowestStock
            .Select((p, idx) => new ProductAttentionPoint
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Stock = p.StockQuantity,
                Threshold = p.LowStockThreshold,
                Revenue = p.SellingPrice * p.StockQuantity,
                Rank = idx + 1,
                Unit = string.IsNullOrWhiteSpace(p.Unit) ? "pcs" : p.Unit,
                SuggestedRestockQty = Math.Max(10, p.LowStockThreshold * 2 - p.StockQuantity)
            })
            .ToList();

        return new DashboardViewModel
        {
            TotalRevenue = totalRevenue,
            TotalOrders = orderCount,
            AvgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0,
            RevenueGrowth = await CalculateRevenueGrowthAsync(storeId, totalRevenue, startDate, now),
            LowStockCount = await _db.Products.CountAsync(p => p.StoreId == storeId && p.IsActive && p.StockQuantity <= p.LowStockThreshold),
            RevenueTrend = revenueTrend,
            CategorySales = categorySales,
            TopPerformers = topPerformers,
            NeedsAttention = needsAttention
        };
    }

    private async Task<decimal> CalculateRevenueGrowthAsync(Guid storeId, decimal currentTotal, DateTime startDate, DateTime now)
    {
        var periodDays = (now - startDate).Days;
        if (periodDays <= 0) return 0;

        var previousStart = startDate.AddDays(-periodDays);
        var previousTotal = await _db.Orders
            .Where(o => o.StoreId == storeId
                && o.Status != "cancelled" && o.Status != "returned"
                && o.OrderDate >= previousStart && o.OrderDate < startDate)
            .SumAsync(o => o.Total);

        if (previousTotal == 0) return currentTotal > 0 ? 100 : 0;
        return Math.Round((currentTotal - previousTotal) / previousTotal * 100, 1);
    }

    private static DateTime GetRangeStart(string range, DateTime now) => range switch
    {
        "7d" => now.AddDays(-7),
        "15d" => now.AddDays(-15),
        "90d" => now.AddDays(-90),
        "1y" => now.AddYears(-1),
        _ => now.AddDays(-30)
    };
}
