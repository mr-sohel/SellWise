using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Dashboard;

namespace SellWise.Web.Services;

/// <summary>Builds the owner dashboard: sales KPIs, charts and per-product demand forecasts.</summary>
public class AnalyticsService
{
    private const int HistoryDays = 90;
    private const int ForecastDays = 30;
    private static readonly TimeSpan ForecastCacheLifetime = TimeSpan.FromHours(24);

    private readonly AppDbContext _db;
    private readonly ForecastService _forecastService;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(AppDbContext db, ForecastService forecastService, ILogger<AnalyticsService> logger)
    {
        _db = db;
        _forecastService = forecastService;
        _logger = logger;
    }

    public async Task<DashboardViewModel> GetOverview(Guid storeId, string range, int page = 1, int pageSize = 8)
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

        var forecastPage = await GetForecastsPageAsync(storeId, range, page, pageSize);

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
            NeedsAttention = needsAttention,
            ProductForecasts = forecastPage.ProductForecasts,
            TotalForecastProducts = forecastPage.TotalProducts,
            DemandForecast = SumDailyDemand(forecastPage.ProductForecasts, now)
        };
    }

    /// <summary>
    /// Returns one page of product forecast cards. Products are ranked by units sold in the
    /// selected range (best sellers first, then unsold products by name).
    /// </summary>
    public async Task<ForecastPagedViewModel> GetForecastsPageAsync(Guid storeId, string range, int page = 1, int pageSize = 8)
    {
        var now = DateTime.UtcNow;
        var startDate = GetRangeStart(range, now);
        var horizonDays = GetHorizonDays(range);

        var unitsSold = await _db.OrderItems
            .Where(oi => oi.ProductId != null && oi.Order.StoreId == storeId
                && oi.Order.Status != "cancelled" && oi.Order.Status != "returned"
                && oi.Order.OrderDate >= startDate)
            .GroupBy(oi => oi.ProductId!.Value)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
            .ToDictionaryAsync(x => x.ProductId, x => x.Quantity);

        var activeProducts = await _db.Products
            .Where(p => p.StoreId == storeId && p.IsActive)
            .Select(p => new { p.Id, p.Name })
            .ToListAsync();

        var pageIds = activeProducts
            .OrderByDescending(p => unitsSold.GetValueOrDefault(p.Id))
            .ThenBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => p.Id)
            .ToList();

        var products = (await _db.Products.Where(p => pageIds.Contains(p.Id)).ToListAsync())
            .OrderBy(p => pageIds.IndexOf(p.Id))
            .ToList();

        var cards = await BuildForecastCardsAsync(storeId, products, horizonDays, now);

        return new ForecastPagedViewModel
        {
            ProductForecasts = cards.OrderByDescending(c => c.PredictedUnits).ToList(),
            CurrentPage = page,
            TotalPages = Math.Max(1, (int)Math.Ceiling(activeProducts.Count / (double)pageSize)),
            TotalProducts = activeProducts.Count,
            Range = range
        };
    }

    /// <summary>
    /// Forecast flow per product: use cached predictions if they are less than 24h old,
    /// otherwise call the ML service, otherwise fall back to replaying recent sales.
    /// </summary>
    private async Task<List<ProductForecastCard>> BuildForecastCardsAsync(Guid storeId, List<Product> products, int horizonDays, DateTime now)
    {
        var productIds = products.Select(p => p.Id).ToList();
        var today = now.Date;

        var cached = (await _db.Forecasts
                .Where(f => f.StoreId == storeId && productIds.Contains(f.ProductId)
                    && f.CreatedAt > now - ForecastCacheLifetime
                    && f.TargetDate > today)
                .ToListAsync())
            .GroupBy(f => f.ProductId)
            .ToDictionary(g => g.Key, g => g.OrderBy(f => f.TargetDate).Select(f => f.PredictedDemand).ToList());

        var historyStart = today.AddDays(-HistoryDays);
        var history = await _db.OrderItems
            .Where(oi => oi.ProductId != null && productIds.Contains(oi.ProductId.Value)
                && oi.Order.StoreId == storeId
                && oi.Order.Status != "cancelled" && oi.Order.Status != "returned"
                && oi.Order.OrderDate >= historyStart)
            .Select(oi => new { ProductId = oi.ProductId!.Value, oi.Order.OrderDate, oi.Quantity })
            .ToListAsync();

        // Each product's ML call is independent, so run them in parallel. Only the HTTP calls
        // run concurrently; the DbContext is not touched inside these tasks.
        var tasks = products.Select(async product =>
        {
            if (cached.TryGetValue(product.Id, out var cachedValues))
                return (Card: BuildCard(product, cachedValues, horizonDays), NewRows: new List<Forecast>());

            var dailySales = DailySeries(
                history.Where(h => h.ProductId == product.Id).Select(h => (h.OrderDate, (double)h.Quantity)),
                historyStart, today);

            var result = await _forecastService.GetForecastAsync(storeId, product.Id, dailySales, ForecastDays);
            if (result?.forecast is { Count: > 0 } points)
            {
                var rows = points.Select(f => new Forecast
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

                return (Card: BuildCard(product, rows.Select(r => r.PredictedDemand).ToList(), horizonDays), NewRows: rows);
            }

            return (Card: BuildCard(product, FallbackForecast(dailySales, ForecastDays), horizonDays), NewRows: new List<Forecast>());
        });

        var results = await Task.WhenAll(tasks);
        await SaveForecastsAsync(storeId, results.SelectMany(r => r.NewRows).ToList());
        return results.Select(r => r.Card).ToList();
    }

    /// <summary>
    /// Replaces the cached rows for the refreshed products. Old rows must be deleted first:
    /// tomorrow's 30-day forecast overlaps 29 dates with today's, and (StoreId, ProductId,
    /// TargetDate) is unique.
    /// </summary>
    private async Task SaveForecastsAsync(Guid storeId, List<Forecast> rows)
    {
        if (rows.Count == 0) return;

        var refreshedIds = rows.Select(r => r.ProductId).Distinct().ToList();
        await _db.Forecasts
            .Where(f => f.StoreId == storeId && refreshedIds.Contains(f.ProductId))
            .ExecuteDeleteAsync();

        _db.Forecasts.AddRange(rows);
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // Another request refreshed the same products at the same moment; its rows are equivalent.
            _logger.LogDebug(ex, "Concurrent forecast refresh for store {StoreId}; keeping existing rows", storeId);
            foreach (var entry in _db.ChangeTracker.Entries<Forecast>().ToList())
                entry.State = EntityState.Detached;
        }
    }

    /// <summary>
    /// Used when the ML service is unavailable: repeat the last 14 days of actual sales so the
    /// projection keeps weekday/weekend variation instead of a flat line.
    /// </summary>
    public static List<double> FallbackForecast(List<SalesHistoryPoint> dailySales, int days)
    {
        var window = dailySales.TakeLast(14).Select(h => Math.Max(0, h.y)).ToList();
        if (window.Count == 0)
            return Enumerable.Repeat(0d, days).ToList();

        return Enumerable.Range(0, days).Select(i => window[i % window.Count]).ToList();
    }

    /// <summary>Turns individual sales into one point per day between start and end, filling gaps with 0.</summary>
    public static List<SalesHistoryPoint> DailySeries(IEnumerable<(DateTime Date, double Quantity)> sales, DateTime start, DateTime end)
    {
        var byDay = sales.GroupBy(s => s.Date.Date).ToDictionary(g => g.Key, g => g.Sum(s => s.Quantity));

        var series = new List<SalesHistoryPoint>();
        for (var day = start.Date; day <= end.Date; day = day.AddDays(1))
            series.Add(new SalesHistoryPoint { ds = day, y = byDay.GetValueOrDefault(day) });
        return series;
    }

    public static ProductForecastCard BuildCard(Product product, List<double> dailyValues, int horizonDays)
    {
        var values = dailyValues.Take(horizonDays).ToList();
        var predictedUnits = values.Sum();
        var dailyAvg = values.Count > 0 ? values.Average() : 0;

        var firstWeek = values.Take(7).DefaultIfEmpty(0).Average();
        var lastWeek = values.TakeLast(7).DefaultIfEmpty(0).Average();
        double trendPct = firstWeek >= 0.05
            ? Math.Round((lastWeek - firstWeek) / firstWeek * 100, 1)
            : lastWeek >= 0.05 ? 100 : 0;
        var trend = trendPct >= 5 ? "rising" : trendPct <= -5 ? "falling" : "stable";

        var restockQty = Math.Max(0, Math.Ceiling(predictedUnits - product.StockQuantity));

        return new ProductForecastCard
        {
            ProductId = product.Id,
            ProductName = product.Name,
            Category = product.Category ?? "Other",
            Unit = product.Unit,
            SparklineData = values.Select(v => Math.Round(v, 1)).ToList(),
            PredictedUnits = Math.Round(predictedUnits, 1),
            Stock = product.StockQuantity,
            DailyAverage = Math.Round(dailyAvg, 1),
            ForecastHorizonDays = horizonDays,
            RestockQty = restockQty,
            DaysOfCover = dailyAvg > 0 ? (int)Math.Floor(product.StockQuantity / dailyAvg) : 999,
            HasStockOutRisk = restockQty > 0,
            Trend = trend,
            TrendPct = trendPct
        };
    }

    /// <summary>Total predicted units per day across the products on the current page (for the demand chart).</summary>
    private static List<ForecastPoint> SumDailyDemand(List<ProductForecastCard> cards, DateTime now)
    {
        var days = cards.Count == 0 ? 0 : cards.Max(c => c.SparklineData.Count);
        return Enumerable.Range(0, days)
            .Select(i => new ForecastPoint
            {
                Date = now.Date.AddDays(i + 1).ToString("MMM dd"),
                PredictedDemand = Math.Round(cards.Sum(c => c.SparklineData.ElementAtOrDefault(i)), 1)
            })
            .ToList();
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

    private static int GetHorizonDays(string range) => range switch
    {
        "7d" => 7,
        "15d" => 15,
        _ => 30
    };
}
