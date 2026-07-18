using System;

namespace SellWise.Web.Models;

public class Forecast
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StoreId { get; set; }
    public Store Store { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTime TargetDate { get; set; }
    public double PredictedDemand { get; set; }
    public double LowerBound { get; set; }
    public double UpperBound { get; set; }
    public string ModelUsed { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
