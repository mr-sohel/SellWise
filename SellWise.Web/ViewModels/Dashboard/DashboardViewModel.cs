using System.Collections.Generic;

namespace SellWise.Web.ViewModels.Dashboard;

public class DashboardViewModel
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public decimal AvgOrderValue { get; set; }
    public decimal RevenueGrowth { get; set; }
    public int LowStockCount { get; set; }
    
    public List<RevenuePoint> RevenueTrend { get; set; } = new List<RevenuePoint>();

    public List<CategorySalesPoint> CategorySales { get; set; } = new List<CategorySalesPoint>();
    public List<ProductPerformancePoint> TopPerformers { get; set; } = new List<ProductPerformancePoint>();
    public List<ProductAttentionPoint> NeedsAttention { get; set; } = new List<ProductAttentionPoint>();
}

public class RevenuePoint
{
    public string? Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
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
    public System.Guid ProductId { get; set; }
    public string? ProductName { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int Threshold { get; set; }
    public decimal Revenue { get; set; }
    public int Rank { get; set; }
    public string? Unit { get; set; } = "pcs";
    public int SuggestedRestockQty { get; set; } = 10;
}
