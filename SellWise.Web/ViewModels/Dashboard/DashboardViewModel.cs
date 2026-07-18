using System.Collections.Generic;

namespace SellWise.Web.ViewModels.Dashboard;

public class DashboardViewModel
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AvgOrderValue { get; set; }
    public decimal RevenueGrowth { get; set; }
    public int HealthScore { get; set; }
    
    public List<RevenuePoint> RevenueTrend { get; set; } = new List<RevenuePoint>();
    public List<ForecastPoint> DemandForecast { get; set; } = new List<ForecastPoint>();
}

public class RevenuePoint
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class ForecastPoint
{
    public string Date { get; set; } = string.Empty;
    public double PredictedDemand { get; set; }
}
