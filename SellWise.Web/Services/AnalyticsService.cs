using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Dashboard;

namespace SellWise.Web.Services;

public class AnalyticsService
{
    private readonly AppDbContext _db;
    private readonly ForecastService _forecastService;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(AppDbContext db, ForecastService forecastService, ILogger<AnalyticsService> logger)
    {
        _db = db;
        _forecastService = forecastService;
        _logger = logger;
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

        var orderQuery = _db.Orders
            .Where(o => o.StoreId == storeId && o.Status != "cancelled" && o.Status != "returned" && o.OrderDate >= startDate);

        var totalRevenue = await orderQuery.SumAsync(o => o.Total);
        var orderCount = await orderQuery.CountAsync();
        var avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        // EF Core translation for GroupBy on date (requires taking Date property)
        var revenueTrendData = await orderQuery
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.Total) })
            .OrderBy(g => g.Date)
            .ToListAsync();

        var revenueTrend = revenueTrendData
            .Select(g => new RevenuePoint { Date = g.Date.ToString("MMM dd"), Revenue = g.Revenue })
            .ToList();

        var orderItemsQuery = _db.OrderItems
            .Where(oi => oi.Order.StoreId == storeId && oi.Order.Status != "cancelled" && oi.Order.Status != "returned" && oi.Order.OrderDate >= startDate);

        var totalItemSales = await orderItemsQuery.SumAsync(oi => oi.Quantity * oi.UnitPrice);

        var categorySalesData = await orderItemsQuery
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.Product!.Category)
            .Select(g => new { Category = g.Key, Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice) })
            .ToListAsync();

        var categorySales = categorySalesData
            .Select(g => {
                var categoryName = string.IsNullOrEmpty(g.Category) ? "Other" : g.Category;
                return new CategorySalesPoint {
                    Category = categoryName,
                    Revenue = g.Revenue,
                    Percentage = totalItemSales > 0 ? (double)Math.Round((g.Revenue / totalItemSales) * 100, 1) : 0
                };
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        var topPerformersData = await orderItemsQuery
            .Where(oi => oi.ProductName != null)
            .GroupBy(oi => oi.ProductName)
            .Select(g => new { ProductName = g.Key, Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice) })
            .OrderByDescending(p => p.Revenue)
            .Take(5)
            .ToListAsync();

        var topPerformers = topPerformersData
            .Select((p, idx) => new ProductPerformancePoint {
                ProductName = p.ProductName,
                Revenue = p.Revenue,
                Rank = idx + 1
            })
            .ToList();

        var needsAttentionData = await _db.Products
            .Where(p => p.StoreId == storeId)
            .OrderBy(p => p.StockQuantity)
            .Take(5)
            .Select(p => new {
                p.Name,
                p.StockQuantity,
                p.LowStockThreshold,
                p.SellingPrice
            })
            .ToListAsync();

        var needsAttention = needsAttentionData
            .Select((p, idx) => new ProductAttentionPoint {
                ProductName = p.Name,
                Stock = p.StockQuantity,
                Threshold = p.LowStockThreshold,
                Revenue = p.SellingPrice * p.StockQuantity,
                Rank = idx + 1
            })
            .ToList();

        var topProductsData = await orderItemsQuery
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(g => g.Quantity)
            .Take(6)
            .ToListAsync();

        var topProductIdsRaw = topProductsData.Select(p => p.ProductId).ToList();

        var topProducts = await _db.Products
            .Where(p => topProductIdsRaw.Contains(p.Id))
            .ToListAsync();

        // Ensure order is maintained
        topProducts = topProductsData
            .Join(topProducts, td => td.ProductId, p => p.Id, (td, p) => p)
            .ToList();

        var topProductIds = topProducts.Select(p => p.Id).ToList();

        var allCached = await _db.Forecasts
            .Where(f => f.StoreId == storeId && topProductIds.Contains(f.ProductId) && f.CreatedAt > now.AddHours(-24))
            .ToListAsync();

        var allHistoryData = await _db.OrderItems
            .Where(oi => oi.ProductId.HasValue && topProductIds.Contains(oi.ProductId.Value)
                && oi.Order.StoreId == storeId
                && oi.Order.Status != "cancelled"
                && oi.Order.Status != "returned"
                && oi.Order.OrderDate >= now.AddDays(-90))
            .Select(oi => new { ProductId = oi.ProductId.Value, oi.Order.OrderDate, oi.Quantity })
            .ToListAsync();

        var results = new List<(ProductForecastCard Card, List<Forecast> NewForecasts)>();

        foreach (var product in topProducts)
        {
            var productCached = allCached.Where(f => f.ProductId == product.Id).OrderBy(f => f.TargetDate).ToList();

            var productHistory = allHistoryData
                .Where(oi => oi.ProductId == product.Id)
                .GroupBy(oi => oi.OrderDate.Date)
                .Select(g => new SalesHistoryPoint
                {
                    ds = g.Key,
                    y = g.Sum(oi => (double)oi.Quantity)
                })
                .OrderBy(h => h.ds)
                .ToList();

            var forecastResult = await GetProductForecastAsync(storeId, product, now, productCached, productHistory);
            results.Add(forecastResult);
        }
        var productForecasts = results.Select(r => r.Card)
                                      .OrderByDescending(c => c.PredictedUnits)
                                      .ToList();

        var newForecasts = results.SelectMany(r => r.NewForecasts).ToList();
        if (newForecasts.Any())
        {
            _db.Forecasts.AddRange(newForecasts);
            await _db.SaveChangesAsync();
        }

        var demandForecast = await GetDemandForecast(storeId, topProducts, now);

        return new DashboardViewModel
        {
            TotalRevenue = totalRevenue,
            TotalOrders = orderCount,
            AvgOrderValue = avgOrderValue,
            RevenueGrowth = await CalculateRevenueGrowth(storeId, totalRevenue, startDate, now),
            HealthScore = CalculateHealthScore(orderCount, topProducts),
            RevenueTrend = revenueTrend,
            DemandForecast = demandForecast,
            CategorySales = categorySales,
            TopPerformers = topPerformers,
            NeedsAttention = needsAttention,
            ProductForecasts = productForecasts
        };
    }

    private async Task<(ProductForecastCard, List<Forecast>)> GetProductForecastAsync(Guid storeId, Product product, DateTime now, List<Forecast> cached, List<SalesHistoryPoint> history)
    {
        if (cached.Any())
        {
            return (new ProductForecastCard
            {
                ProductName = product.Name,
                Category = product.Category ?? "Other",
                SparklineData = cached.Select(f => f.PredictedDemand).ToList(),
                PredictedUnits = cached.Sum(f => f.PredictedDemand),
                Stock = product.StockQuantity,
                DailyAverage = Math.Round(cached.Average(f => f.PredictedDemand), 1)
            }, new List<Forecast>());
        }

        var paddedHistory = PadHistoryWithZeros(history, now.AddDays(-90), now);

        if (paddedHistory.Count >= 7)
        {
            try
            {
                var result = await _forecastService.GetForecastAsync(storeId, product.Id, paddedHistory, periods: 30);

                if (result?.forecast != null && result.forecast.Any())
                {
                    var forecasts = result.forecast.Select(f => new Forecast
                    {
                        StoreId = storeId,
                        ProductId = product.Id,
                        TargetDate = f.ds,
                        PredictedDemand = Math.Max(0, f.yhat),
                        LowerBound = Math.Max(0, f.yhat_lower),
                        UpperBound = Math.Max(0, f.yhat_upper),
                        ModelUsed = paddedHistory.Count >= 30 ? "prophet" : "ewma",
                        CreatedAt = now
                    }).ToList();

                    var card = new ProductForecastCard
                    {
                        ProductName = product.Name,
                        Category = product.Category ?? "Other",
                        SparklineData = result.forecast.Select(f => Math.Max(0, f.yhat)).ToList(),
                        PredictedUnits = result.forecast.Sum(f => Math.Max(0, f.yhat)),
                        Stock = product.StockQuantity,
                        DailyAverage = Math.Round(result.forecast.Average(f => Math.Max(0, f.yhat)), 1)
                    };

                    return (card, forecasts);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "ML forecast failed for product {ProductName}, using fallback", product.Name);
            }
        }

        return (GetFallbackForecast(product, paddedHistory), new List<Forecast>());
    }

    private async Task<List<ForecastPoint>> GetDemandForecast(Guid storeId, List<Product> products, DateTime now)
    {
        var allForecasts = new List<ForecastPoint>();

        var productIds = products.Select(p => p.Id).ToList();
        var cached = await _db.Forecasts
            .Where(f => f.StoreId == storeId && productIds.Contains(f.ProductId) && f.CreatedAt > now.AddHours(-24))
            .OrderBy(f => f.TargetDate)
            .ToListAsync();

        if (cached.Any())
        {
            var grouped = cached
                .GroupBy(f => f.TargetDate.Date)
                .OrderBy(g => g.Key)
                .Select(g => new ForecastPoint
                {
                    Date = g.Key.ToString("MMM dd"),
                    PredictedDemand = g.Sum(f => f.PredictedDemand)
                });

            allForecasts.AddRange(grouped);
        }

        if (allForecasts.Any())
        {
            return allForecasts;
        }

        var past30DaysStart = now.AddDays(-30);
        var totalHistoricalQuantity = await _db.OrderItems
            .Where(oi => oi.Order.StoreId == storeId
                && oi.ProductId.HasValue && productIds.Contains(oi.ProductId.Value)
                && oi.Order.Status != "cancelled"
                && oi.Order.Status != "returned"
                && oi.Order.OrderDate >= past30DaysStart)
            .SumAsync(oi => (double?)oi.Quantity) ?? 0;

        double movingAverage = totalHistoricalQuantity / 30.0;

        var fallback = new List<ForecastPoint>();
        for (int i = 1; i <= 30; i++)
        {
            var forecastDate = now.AddDays(i);
            fallback.Add(new ForecastPoint
            {
                Date = forecastDate.ToString("MMM dd"),
                PredictedDemand = Math.Round(movingAverage, 1)
            });
        }
        return fallback;
    }

    private async Task<decimal> CalculateRevenueGrowth(Guid storeId, decimal currentTotal, DateTime startDate, DateTime now)
    {
        var periodDays = (now - startDate).Days;
        if (periodDays <= 0) return 0;

        var previousStart = startDate.AddDays(-periodDays);
        var previousOrders = await _db.Orders
            .Where(o => o.StoreId == storeId
                && o.Status != "cancelled"
                && o.Status != "returned"
                && o.OrderDate >= previousStart
                && o.OrderDate < startDate)
            .SumAsync(o => o.Total);

        if (previousOrders == 0) return currentTotal > 0 ? 100 : 0;

        return Math.Round(((currentTotal - previousOrders) / previousOrders) * 100, 1);
    }

    private int CalculateHealthScore(int orderCount, List<Product> products)
    {
        int score = 50;
        if (orderCount > 100) score += 20;
        else if (orderCount > 50) score += 10;

        var lowStockCount = products.Count(p => p.StockQuantity <= p.LowStockThreshold);
        score -= lowStockCount * 5;

        return Math.Clamp(score, 0, 100);
    }

    private ProductForecastCard GetFallbackForecast(Product product, List<SalesHistoryPoint> history)
    {
        var avgDaily = history.Any() ? history.Average(h => h.y) : 0;
        var sparkline = new List<double>();
        for (int i = 0; i < 30; i++)
        {
            sparkline.Add(Math.Max(0, Math.Round(avgDaily + (Math.Sin(i * 0.5) * avgDaily * 0.2))));
        }

        return new ProductForecastCard
        {
            ProductName = product.Name,
            Category = product.Category ?? "Other",
            SparklineData = sparkline,
            PredictedUnits = sparkline.Sum(),
            Stock = product.StockQuantity,
            DailyAverage = Math.Round(avgDaily, 1)
        };
    }

    private List<SalesHistoryPoint> PadHistoryWithZeros(List<SalesHistoryPoint> history, DateTime start, DateTime end)
    {
        var dict = history.ToDictionary(h => h.ds.Date, h => h.y);
        var padded = new List<SalesHistoryPoint>();
        var current = start.Date;
        var endDate = end.Date;

        while (current <= endDate)
        {
            padded.Add(new SalesHistoryPoint
            {
                ds = current,
                y = dict.TryGetValue(current, out var val) ? val : 0
            });
            current = current.AddDays(1);
        }

        return padded;
    }
}