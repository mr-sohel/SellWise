namespace SellWise.Web.Services;

/// <summary>Customer segment names produced by <see cref="RfmService"/>.</summary>
public static class RfmSegments
{
    public const string Champion = "Champion";
    public const string Loyal = "Loyal";
    public const string PotentialLoyalist = "Potential Loyalist";
    public const string NewCustomer = "New Customer";
    public const string AtRisk = "At Risk";
    public const string CantLoseThem = "Can't Lose Them";
    public const string NeedAttention = "Need Attention";
    public const string Lost = "Lost";

    /// <summary>Maps the filter value used in the customer list URL (e.g. "AT_RISK") to a segment name.</summary>
    public static string? FromQueryValue(string? value) => value?.ToUpperInvariant() switch
    {
        "CHAMPION" => Champion,
        "LOYAL" => Loyal,
        "POTENTIAL_LOYALIST" => PotentialLoyalist,
        "NEW_CUSTOMER" => NewCustomer,
        "AT_RISK" => AtRisk,
        "CANT_LOSE_THEM" => CantLoseThem,
        "NEED_ATTENTION" => NeedAttention,
        "LOST" => Lost,
        _ => null
    };
}
