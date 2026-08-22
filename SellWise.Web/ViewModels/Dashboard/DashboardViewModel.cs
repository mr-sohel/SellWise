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

    // New properties matching screenshots
    public List<CategorySalesPoint> CategorySales { get; set; } = new List<CategorySalesPoint>();
    public List<ProductPerformancePoint> TopPerformers { get; set; } = new List<ProductPerformancePoint>();
    public List<ProductAttentionPoint> NeedsAttention { get; set; } = new List<ProductAttentionPoint>();
    public List<ProductForecastCard> ProductForecasts { get; set; } = new List<ProductForecastCard>();

    public int TotalForecastProducts { get; set; }
}

public class ForecastPagedViewModel
{
    public List<ProductForecastCard> ProductForecasts { get; set; } = new List<ProductForecastCard>();
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public string Range { get; set; } = "30d";
}

public class RevenuePoint
{
    public string? Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class ForecastPoint
{
    public string? Date { get; set; } = string.Empty;
    public double PredictedDemand { get; set; }
}

public class CategorySalesPoint
{
    public string? Category { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public double Percentage { get; set; }
}

public class ProductPerformancePoint
{
    public string? ProductName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Rank { get; set; }
}

public class ProductAttentionPoint
{
    public string? ProductName { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int Threshold { get; set; }
    public decimal Revenue { get; set; }
    public int Rank { get; set; }
}

public class ProductForecastCard
{
    public string? ProductName { get; set; } = string.Empty;
    public string? Category { get; set; } = string.Empty;
    public List<double> SparklineData { get; set; } = new List<double>();
    public double PredictedUnits { get; set; }
    public int Stock { get; set; }
    public double DailyAverage { get; set; }

    // Business-decision fields
    public int ForecastHorizonDays { get; set; } = 30;
    public double RestockQty { get; set; }
    public int DaysOfCover { get; set; }
    public bool HasStockOutRisk { get; set; }
    public string Trend { get; set; } = "stable";
    public double TrendPct { get; set; }
}
