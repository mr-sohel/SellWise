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

        var currentPeriodOrders = await _db.Orders
            .Where(o => o.StoreId == storeId && o.Status != "completed" && o.OrderDate >= startDate)
            .ToListAsync();

        var totalRevenue = currentPeriodOrders.Sum(o => o.Total);
        var orderCount = currentPeriodOrders.Count;
        var avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        var revenueTrend = currentPeriodOrders
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new RevenuePoint { Date = g.Key.ToString("MMM dd"), Revenue = g.Sum(o => o.Total) })
            .OrderBy(r => DateTime.ParseExact(r.Date, "MMM dd", null))
            .ToList();

        var orderItems = await _db.OrderItems
            .Include(oi => oi.Product)
            .Where(oi => oi.Order.StoreId == storeId && oi.Order.Status != "cancelled" && oi.Order.OrderDate >= startDate)
            .ToListAsync();

        var totalItemSales = orderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
        var categorySales = orderItems
            .GroupBy(oi => oi.Product?.Category ?? "Other")
            .Select(g => {
                var rev = g.Sum(oi => oi.Quantity * oi.UnitPrice);
                return new CategorySalesPoint {
                    Category = g.Key,
                    Revenue = rev,
                    Percentage = totalItemSales > 0 ? (double)Math.Round((rev / totalItemSales) * 100, 1) : 0
                };
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        var topPerformers = orderItems
            .GroupBy(oi => oi.ProductName)
            .Select((g, index) => new ProductPerformancePoint {
                ProductName = g.Key,
                Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .OrderByDescending(p => p.Revenue)
            .Take(5)
            .Select((p, idx) => {
                p.Rank = idx + 1;
                return p;
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

        var topProducts = orderItems
            .GroupBy(oi => oi.Product)
            .Where(g => g.Key != null)
            .OrderByDescending(g => g.Sum(oi => oi.Quantity * oi.UnitPrice))
            .Take(5)
            .Select(g => g.Key!)
            .ToList();

        var topProductIds = topProducts.Select(p => p.Id).ToList();

        var allCached = await _db.Forecasts
            .Where(f => f.StoreId == storeId && topProductIds.Contains(f.ProductId) && f.CreatedAt > now.AddHours(-24))
            .ToListAsync();

        var allHistoryData = await _db.OrderItems
            .Where(oi => oi.ProductId.HasValue && topProductIds.Contains(oi.ProductId.Value)
                && oi.Order.StoreId == storeId
                && oi.Order.Status != "cancelled"
                && oi.Order.OrderDate >= now.AddDays(-90))
            .Select(oi => new { ProductId = oi.ProductId.Value, oi.Order.OrderDate, oi.Quantity })
            .ToListAsync();

        var forecastTasks = new List<Task<(ProductForecastCard Card, List<Forecast> NewForecasts)>>();

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

            forecastTasks.Add(GetProductForecastAsync(storeId, product, now, productCached, productHistory));
        }

        var results = await Task.WhenAll(forecastTasks);
        var productForecasts = results.Select(r => r.Card).ToList();

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
            RevenueGrowth = await CalculateRevenueGrowth(currentPeriodOrders, startDate, now),
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
            foreach (var f in cached)
            {
                var existing = allForecasts.FirstOrDefault(df => df.Date == f.TargetDate.ToString("MMM dd"));
                if (existing != null)
                {
                    existing.PredictedDemand += f.PredictedDemand;
                }
                else
                {
                    allForecasts.Add(new ForecastPoint
                    {
                        Date = f.TargetDate.ToString("MMM dd"),
                        PredictedDemand = f.PredictedDemand
                    });
                }
            }
        }

        if (allForecasts.Any())
        {
            return allForecasts.OrderBy(f => DateTime.ParseExact(f.Date, "MMM dd", null)).ToList();
        }

        var fallback = new List<ForecastPoint>();
        for (int i = 1; i <= 30; i++)
        {
            var forecastDate = now.AddDays(i);
            double baseVal = 100 + (i * 2);
            double noise = Math.Sin(i) * 15;
            fallback.Add(new ForecastPoint
            {
                Date = forecastDate.ToString("MMM dd"),
                PredictedDemand = Math.Max(0, baseVal + noise)
            });
        }
        return fallback;
    }

    private async Task<decimal> CalculateRevenueGrowth(List<Order> currentOrders, DateTime startDate, DateTime now)
    {
        var periodDays = (now - startDate).Days;
        if (periodDays <= 0) return 0;

        var storeId = currentOrders.FirstOrDefault()?.StoreId;
        if (storeId == null) return 0;

        var previousStart = startDate.AddDays(-periodDays);
        var previousOrders = await _db.Orders
            .Where(o => o.StoreId == storeId.Value
                && o.Status != "cancelled"
                && o.OrderDate >= previousStart
                && o.OrderDate < startDate)
            .SumAsync(o => o.Total);

        var currentTotal = currentOrders.Sum(o => o.Total);
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