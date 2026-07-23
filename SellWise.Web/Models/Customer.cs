using System;

namespace SellWise.Web.Models;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StoreId { get; set; }
    public Store Store { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }

    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }

    public DateTime? LastOrderDate { get; set; }
    public int RecencyScore { get; set; }
    public int FrequencyScore { get; set; }
    public int MonetaryScore { get; set; }
    public string RfmSegment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
