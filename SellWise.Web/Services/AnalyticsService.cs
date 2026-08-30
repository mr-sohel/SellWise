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

    private static int GetHorizonDays(string range) => range switch
    {
        "7d" => 7,
        "15d" => 15,
        _ => 30
    };

    public async Task<DashboardViewModel> GetOverview(Guid storeId, string range, int page = 1, int pageSize = 8)
    {
        var now = DateTime.UtcNow;
        var startDate = range switch
        {
            "7d" => now.AddDays(-7),
            "15d" => now.AddDays(-15),
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

        var soldProductsData = await orderItemsQuery
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(g => g.Quantity)
            .ToListAsync();

        var soldProductIdsRaw = soldProductsData.Select(p => p.ProductId).ToList();

        // All store products, sold ones first (by quantity), then unsold ones
        var soldProducts = await _db.Products
            .Where(p => soldProductIdsRaw.Contains(p.Id))
            .ToListAsync();

        var unsoldProducts = await _db.Products
            .Where(p => p.StoreId == storeId && !soldProductIdsRaw.Contains(p.Id))
            .OrderBy(p => p.Name)
            .ToListAsync();

        var topProducts = soldProductsData
            .Join(soldProducts, td => td.ProductId, p => p.Id, (td, p) => p)
            .Concat(unsoldProducts)
            .ToList();

        int totalForecastProducts = topProducts.Count;
        var pagedProducts = topProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var topProductIds = pagedProducts.Select(p => p.Id).ToList();

        var allCached = await _db.Forecasts
            .Where(f => f.StoreId == storeId && topProductIds.Contains(f.ProductId) && f.CreatedAt > now.AddHours(-24))
            .ToListAsync();

        var allHistoryData = await _db.OrderItems
            .Where(oi => oi.ProductId.HasValue && topProductIds.Contains(oi.ProductId.Value)
                && oi.Order.StoreId == storeId
                && oi.Order.Status != "cancelled"
                && oi.Order.Status != "returned"
                && oi.Order.OrderDate >= now.AddDays(-90))
            .Select(oi => new { ProductId = oi.ProductId ?? Guid.Empty, oi.Order.OrderDate, oi.Quantity })
            .ToListAsync();

        var forecastTasks = pagedProducts.Select(async product =>
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

            return await GetProductForecastAsync(storeId, product, now, productCached, productHistory, GetHorizonDays(range));
        });

        var results = (await Task.WhenAll(forecastTasks)).ToList();
        var productForecasts = results.Select(r => r.Item1)
                                      .OrderByDescending(c => c.PredictedUnits)
                                      .ToList();

        var newForecasts = results.SelectMany(r => r.Item2).ToList();
        if (newForecasts.Any())
        {
            _db.Forecasts.AddRange(newForecasts);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // A concurrent request may have cached the same product/date rows
                // first; the unique index rejects them and the cache is already
                // populated, so this is safe to swallow.
                _logger.LogDebug(ex, "Forecast cache insert raced with another request; keeping existing rows");
            }
        }

        var demandForecast = await GetDemandForecast(storeId, pagedProducts, now);

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
            ProductForecasts = productForecasts,
            TotalForecastProducts = totalForecastProducts
        };
    }

    public async Task<ForecastPagedViewModel> GetForecastsPageAsync(Guid storeId, string range, int page = 1, int pageSize = 8)
    {
        var now = DateTime.UtcNow;
        var startDate = range switch
        {
            "7d" => now.AddDays(-7),
            "15d" => now.AddDays(-15),
            "30d" => now.AddDays(-30),
            "90d" => now.AddDays(-90),
            "1y" => now.AddYears(-1),
            _ => now.AddDays(-30)
        };

        var orderItemsQuery = _db.OrderItems
            .Where(oi => oi.Order.StoreId == storeId && oi.Order.Status != "cancelled" && oi.Order.Status != "returned" && oi.Order.OrderDate >= startDate);

        var soldProductsData = await orderItemsQuery
            .Where(oi => oi.Product != null)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(g => g.Quantity)
            .ToListAsync();

        var soldProductIdsRaw = soldProductsData.Select(p => p.ProductId).ToList();

        var soldProducts = await _db.Products
            .Where(p => soldProductIdsRaw.Contains(p.Id))
            .ToListAsync();

        var unsoldProducts = await _db.Products
            .Where(p => p.StoreId == storeId && !soldProductIdsRaw.Contains(p.Id))
            .OrderBy(p => p.Name)
            .ToListAsync();

        var topProducts = soldProductsData
            .Join(soldProducts, td => td.ProductId, p => p.Id, (td, p) => p)
            .Concat(unsoldProducts)
            .ToList();

        int totalForecastProducts = topProducts.Count;
        var pagedProducts = topProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var topProductIds = pagedProducts.Select(p => p.Id).ToList();

        var allCached = await _db.Forecasts
            .Where(f => f.StoreId == storeId && topProductIds.Contains(f.ProductId) && f.CreatedAt > now.AddHours(-24))
            .ToListAsync();

        var allHistoryData = await _db.OrderItems
            .Where(oi => oi.ProductId.HasValue && topProductIds.Contains(oi.ProductId.Value)
                && oi.Order.StoreId == storeId
                && oi.Order.Status != "cancelled"
                && oi.Order.Status != "returned"
                && oi.Order.OrderDate >= now.AddDays(-90))
            .Select(oi => new { ProductId = oi.ProductId ?? Guid.Empty, oi.Order.OrderDate, oi.Quantity })
            .ToListAsync();

        var forecastTasks = pagedProducts.Select(async product =>
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

            return await GetProductForecastAsync(storeId, product, now, productCached, productHistory, GetHorizonDays(range));
        });

        var results = (await Task.WhenAll(forecastTasks)).ToList();
        var productForecasts = results.Select(r => r.Item1)
                                      .OrderByDescending(c => c.PredictedUnits)
                                      .ToList();

        var newForecasts = results.SelectMany(r => r.Item2).ToList();
        if (newForecasts.Any())
        {
            _db.Forecasts.AddRange(newForecasts);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // A concurrent request may have cached the same product/date rows
                // first; the unique index rejects them and the cache is already
                // populated, so this is safe to swallow.
                _logger.LogDebug(ex, "Forecast cache insert raced with another request; keeping existing rows");
            }
        }

        int totalPages = Math.Max(1, (int)Math.Ceiling(totalForecastProducts / (double)pageSize));

        return new ForecastPagedViewModel
        {
            ProductForecasts = productForecasts,
            CurrentPage = page,
            TotalPages = totalPages,
            Range = range
        };
    }

    private async Task<(ProductForecastCard, List<Forecast>)> GetProductForecastAsync(Guid storeId, Product product, DateTime now, List<Forecast> cached, List<SalesHistoryPoint> history, int horizonDays)
    {
        if (cached.Any())
        {
            var values = cached.Select(f => f.PredictedDemand).ToList();
            return (BuildCard(product, values, horizonDays), new List<Forecast>());
        }

        var paddedHistory = PadHistoryWithZeros(history, now.AddDays(-90), now);

        if (paddedHistory.Count >= 7)
        {
            try
            {
                var result = await _forecastService.GetForecastAsync(storeId, product.Id, paddedHistory, periods: 30);

                if (result?.forecast != null && result.forecast.Any())
                {
                    // Always cache the full 30-day horizon so other ranges can reuse it.
                    var forecasts = result.forecast.Select(f => new Forecast
                    {
                        StoreId = storeId,
                        ProductId = product.Id,
                        TargetDate = f.ds,
                        PredictedDemand = Math.Max(0, f.yhat),
                        LowerBound = Math.Max(0, f.yhat_lower),
                        UpperBound = Math.Max(0, f.yhat_upper),
                        ModelUsed = "prophet",
                        CreatedAt = now
                    }).ToList();

                    var values = result.forecast.Select(f => Math.Max(0, f.yhat)).ToList();
                    return (BuildCard(product, values, horizonDays), forecasts);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "ML forecast failed for product {ProductName}, using fallback", product.Name);
            }
        }

        return (GetFallbackForecast(product, paddedHistory, horizonDays), new List<Forecast>());
    }

    private ProductForecastCard BuildCard(Product product, List<double> dailyValues, int horizonDays)
    {
        var values = dailyValues.Take(horizonDays).ToList();
        var predictedUnits = values.Sum();

        var firstWeek = values.Take(7).DefaultIfEmpty(0).Average();
        var lastWeek = values.Skip(Math.Max(0, values.Count - 7)).DefaultIfEmpty(0).Average();

        string trend;
        double trendPct;
        if (firstWeek < 0.05 && lastWeek < 0.05)
        {
            trend = "stable";
            trendPct = 0;
        }
        else if (firstWeek < 0.05)
        {
            trend = "rising";
            trendPct = 100;
        }
        else
        {
            trendPct = Math.Round((lastWeek - firstWeek) / firstWeek * 100, 1);
            trend = trendPct >= 5 ? "rising" : trendPct <= -5 ? "falling" : "stable";
        }

        var dailyAvg = values.Count > 0 ? values.Average() : 0;
        var restockQty = Math.Max(0, Math.Ceiling(predictedUnits - product.StockQuantity));
        var daysOfCover = dailyAvg > 0 ? (int)Math.Floor(product.StockQuantity / dailyAvg) : 999;

        return new ProductForecastCard
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Category = product.Category ?? "Other",
            Unit = product.Unit ?? "pcs",
            SparklineData = values,
            PredictedUnits = Math.Round(predictedUnits, 1),
            Stock = product.StockQuantity,
            DailyAverage = Math.Round(dailyAvg, 1),
            ForecastHorizonDays = horizonDays,
            RestockQty = restockQty,
            DaysOfCover = daysOfCover,
            HasStockOutRisk = restockQty > 0,
            Trend = trend,
            TrendPct = trendPct
        };
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

    private ProductForecastCard GetFallbackForecast(Product product, List<SalesHistoryPoint> history, int horizonDays)
    {
        // Honest fallback: flat moving average of recent daily sales (no
        // synthetic seasonality — that would fake an "AI" signal).
        var avgDaily = history.Any() ? history.Average(h => h.y) : 0;
        var sparkline = Enumerable.Repeat(Math.Max(0, Math.Round(avgDaily)), horizonDays).ToList();

        return new ProductForecastCard
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Category = product.Category ?? "Other",
            Unit = product.Unit ?? "pcs",
            SparklineData = sparkline,
            PredictedUnits = sparkline.Sum(),
            Stock = product.StockQuantity,
            DailyAverage = Math.Round(avgDaily, 1),
            ForecastHorizonDays = horizonDays,
            RestockQty = Math.Max(0, Math.Ceiling(sparkline.Sum() - product.StockQuantity)),
            DaysOfCover = avgDaily > 0 ? (int)Math.Floor(product.StockQuantity / avgDaily) : 999,
            HasStockOutRisk = sparkline.Sum() > product.StockQuantity,
            Trend = "stable",
            TrendPct = 0
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