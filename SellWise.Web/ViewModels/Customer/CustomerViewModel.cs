using System;

namespace SellWise.Web.ViewModels.Customer;

public class CustomerViewModel
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }

    public int RecencyScore { get; set; }
    public int FrequencyScore { get; set; }
    public int MonetaryScore { get; set; }
    public string RfmSegment { get; set; } = string.Empty;

    public string Segment
    {
        get
        {
            if (string.IsNullOrEmpty(RfmSegment)) return "Unscored";
            return RfmSegment;
        }
    }

    public string SegmentClass
    {
        get
        {
            return RfmSegment switch
            {
                "Champion" => "badge-champion",
                "Loyal" => "badge-loyal",
                "Potential Loyalist" => "badge-potential",
                "New Customer" => "badge-new",
                "At Risk" => "badge-risk",
                "Can't Lose Them" => "badge-danger",
                "Lost" => "badge-lost",
                _ => "badge-potential"
            };
        }
    }

    public string RfmText
    {
        get
        {
            if (RecencyScore == 0 && FrequencyScore == 0 && MonetaryScore == 0)
                return "Not calculated";
            return $"R:{RecencyScore} F:{FrequencyScore} M:{MonetaryScore}";
        }
    }
}
