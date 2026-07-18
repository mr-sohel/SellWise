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

    public string Segment
    {
        get
        {
            if (TotalSpent >= 10000000) return "Champion";
            if (TotalSpent >= 5000000) return "Potential";
            return "Promising";
        }
    }

    public string SegmentClass
    {
        get
        {
            if (TotalSpent >= 10000000) return "badge-champion";
            return "badge-potential";
        }
    }

    public string RfmText
    {
        get
        {
            if (TotalSpent >= 10000000) return "R:5 F:5 M:5";
            if (TotalSpent >= 5000000) return "R:2 F:5 M:5";
            return "R:3 F:3 M:3";
        }
    }
}
