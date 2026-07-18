using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Dashboard;

namespace SellWise.Web.Services;

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
        var startDate = range switch
        {
            "7d" => now.AddDays(-7),
            "30d" => now.AddDays(-30),
            "90d" => now.AddDays(-90),
            "1y" => now.AddYears(-1),
            _ => now.AddDays(-30)
        };

        var currentPeriodOrders = await _db.Orders
            .Where(o => o.StoreId == storeId && o.Status != "cancelled" && o.OrderDate >= startDate)
            .ToListAsync();

        var totalRevenue = currentPeriodOrders.Sum(o => o.Total);
        var orderCount = currentPeriodOrders.Count;
        var avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        // Group by day for the chart
        var revenueTrend = currentPeriodOrders
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new RevenuePoint { Date = g.Key.ToString("MMM dd"), Revenue = g.Sum(o => o.Total) })
            .OrderBy(r => r.Date)
            .ToList();

        var demandForecast = new List<ForecastPoint>();
        for (int i = 1; i <= 30; i++)
        {
            var forecastDate = now.AddDays(i);
            // Mock a seasonal/trending forecast wave
            double baseDemand = 100 + (i * 2); 
            double noise = (Math.Sin(i) * 15);
            demandForecast.Add(new ForecastPoint
            {
                Date = forecastDate.ToString("MMM dd"),
                PredictedDemand = Math.Max(0, baseDemand + noise)
            });
        }

        return new DashboardViewModel
        {
            TotalRevenue = totalRevenue,
            TotalOrders = orderCount,
            AvgOrderValue = avgOrderValue,
            RevenueGrowth = 5.2m, // Mock growth for now
            HealthScore = 85,
            RevenueTrend = revenueTrend,
            DemandForecast = demandForecast
        };
    }
}
