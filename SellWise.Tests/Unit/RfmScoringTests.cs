using SellWise.Web.Services;

namespace SellWise.Tests.Unit;

public class RfmScoringTests
{
    [Theory]
    [InlineData(0, 5)]
    [InlineData(30, 5)]
    [InlineData(31, 4)]
    [InlineData(90, 3)]
    [InlineData(180, 2)]
    [InlineData(181, 1)]
    public void RecencyScore_UsesDayBuckets(int days, int expected)
    {
        Assert.Equal(expected, RfmScoring.RecencyScore(days));
    }

    [Theory]
    [InlineData(5, 5, 5, RfmSegments.Champion)]
    [InlineData(3, 3, 3, RfmSegments.Loyal)]
    [InlineData(5, 1, 1, RfmSegments.NewCustomer)]
    [InlineData(3, 2, 2, RfmSegments.PotentialLoyalist)]
    [InlineData(1, 5, 5, RfmSegments.CantLoseThem)]
    [InlineData(2, 3, 3, RfmSegments.AtRisk)]
    [InlineData(1, 1, 1, RfmSegments.Lost)]
    [InlineData(2, 3, 1, RfmSegments.NeedAttention)]
    public void Segment_MapsScoresToSegments(int r, int f, int m, string expected)
    {
        Assert.Equal(expected, RfmScoring.Segment(r, f, m));
    }

    [Fact]
    public void Percentile_InterpolatesBetweenValues()
    {
        var values = new List<decimal> { 10, 20, 30, 40, 50 };

        Assert.Equal(10m, RfmScoring.Percentile(values, 0));
        Assert.Equal(30m, RfmScoring.Percentile(values, 50));
        Assert.Equal(40m, RfmScoring.Percentile(values, 75));
        Assert.Equal(46m, RfmScoring.Percentile(values, 90));   // index 3.6 → 40 + 0.6 × 10
        Assert.Equal(50m, RfmScoring.Percentile(values, 100));
    }

    [Fact]
    public void PercentileScore_RanksAgainstOtherCustomers()
    {
        var spending = Enumerable.Range(1, 100).Select(i => (decimal)i).ToList();

        Assert.Equal(5, RfmScoring.PercentileScore(95, spending));
        Assert.Equal(3, RfmScoring.PercentileScore(60, spending));
        Assert.Equal(1, RfmScoring.PercentileScore(10, spending));
    }

    [Fact]
    public void PercentileScore_CustomerWithNoOrders_ScoresLowest()
    {
        Assert.Equal(1, RfmScoring.PercentileScore(0, new List<decimal>()));
        Assert.Equal(1, RfmScoring.PercentileScore(0, new List<decimal> { 0, 0, 5 }));
    }
}
