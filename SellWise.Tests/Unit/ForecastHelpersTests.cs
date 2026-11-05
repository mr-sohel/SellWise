using SellWise.Web.Models;
using SellWise.Web.Services;

namespace SellWise.Tests.Unit;

public class ForecastHelpersTests
{
    [Fact]
    public void DailySeries_FillsMissingDaysWithZero_AndSumsSameDay()
    {
        var start = new DateTime(2026, 1, 1);
        var sales = new[]
        {
            (start.AddHours(9), 2.0),
            (start.AddHours(15), 3.0),
            (start.AddDays(2).AddHours(10), 1.0)
        };

        var series = AnalyticsService.DailySeries(sales, start, start.AddDays(3));

        Assert.Equal(new[] { 5.0, 0, 1, 0 }, series.Select(p => p.y));
        Assert.Equal(start.AddDays(1), series[1].ds);
    }

    [Fact]
    public void FallbackForecast_RepeatsTheLast14Days()
    {
        var history = Enumerable.Range(1, 20)
            .Select(i => new SalesHistoryPoint { ds = new DateTime(2026, 1, i), y = i })
            .ToList();

        var forecast = AnalyticsService.FallbackForecast(history, days: 16);

        // Last 14 days are 7..20, so the projection cycles 7..20 then starts again at 7.
        Assert.Equal(7, forecast[0]);
        Assert.Equal(20, forecast[13]);
        Assert.Equal(7, forecast[14]);
        Assert.Equal(16, forecast.Count);
    }

    [Fact]
    public void FallbackForecast_WithNoHistory_IsZero()
    {
        Assert.All(AnalyticsService.FallbackForecast(new List<SalesHistoryPoint>(), 5), v => Assert.Equal(0, v));
    }

    [Fact]
    public void BuildCard_SuggestsRestockWhenDemandExceedsStock()
    {
        var product = new Product { Name = "Phone", StockQuantity = 10, Unit = "pcs" };
        var daily = Enumerable.Repeat(2.0, 30).ToList();   // 60 units over 30 days

        var card = AnalyticsService.BuildCard(product, daily, horizonDays: 30);

        Assert.Equal(60, card.PredictedUnits);
        Assert.Equal(50, card.RestockQty);
        Assert.Equal(5, card.DaysOfCover);
        Assert.True(card.HasStockOutRisk);
        Assert.Equal("stable", card.Trend);
    }

    [Fact]
    public void BuildCard_OnlyUsesTheRequestedHorizon()
    {
        var product = new Product { Name = "Phone", StockQuantity = 100 };
        var daily = Enumerable.Repeat(1.0, 30).ToList();

        var card = AnalyticsService.BuildCard(product, daily, horizonDays: 7);

        Assert.Equal(7, card.PredictedUnits);
        Assert.Equal(7, card.SparklineData.Count);
        Assert.False(card.HasStockOutRisk);
    }
}
