namespace SellWise.Web.Services;

/// <summary>
/// Pure RFM (Recency, Frequency, Monetary) scoring rules. Each dimension is scored 1-5;
/// frequency and monetary are scored relative to the store's other customers (percentiles).
/// </summary>
public static class RfmScoring
{
    public static int RecencyScore(int daysSinceLastOrder) => daysSinceLastOrder switch
    {
        <= 30 => 5,
        <= 60 => 4,
        <= 90 => 3,
        <= 180 => 2,
        _ => 1
    };

    /// <summary>Scores a value against the 25th/50th/75th/90th percentiles of all customers.</summary>
    public static int PercentileScore(decimal value, IReadOnlyList<decimal> sortedValues)
    {
        if (sortedValues.Count == 0 || value <= 0) return 1;
        if (value >= Percentile(sortedValues, 90)) return 5;
        if (value >= Percentile(sortedValues, 75)) return 4;
        if (value >= Percentile(sortedValues, 50)) return 3;
        if (value >= Percentile(sortedValues, 25)) return 2;
        return 1;
    }

    /// <summary>Linear-interpolated percentile of an ascending list.</summary>
    public static decimal Percentile(IReadOnlyList<decimal> sortedValues, int percentile)
    {
        if (sortedValues.Count == 0) return 0;

        var index = percentile / 100.0 * (sortedValues.Count - 1);
        var lower = (int)Math.Floor(index);
        var upper = (int)Math.Ceiling(index);
        return sortedValues[lower] + (decimal)(index - lower) * (sortedValues[upper] - sortedValues[lower]);
    }

    /// <summary>
    /// Maps scores to a segment. Order matters: more specific rules come first
    /// (e.g. "Can't Lose Them" must be checked before the broader "At Risk").
    /// </summary>
    public static string Segment(int r, int f, int m)
    {
        if (r >= 4 && f >= 4 && m >= 4) return RfmSegments.Champion;
        if (r >= 3 && f >= 3 && m >= 3) return RfmSegments.Loyal;
        if (r >= 4 && f <= 2) return RfmSegments.NewCustomer;
        if (r >= 3 && m >= 2) return RfmSegments.PotentialLoyalist;
        if (r <= 2 && f >= 4 && m >= 4) return RfmSegments.CantLoseThem;
        if (r <= 2 && f >= 3 && m >= 3) return RfmSegments.AtRisk;
        if (r <= 2 && f <= 2) return RfmSegments.Lost;
        return RfmSegments.NeedAttention;
    }
}
