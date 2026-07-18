using System;

namespace SellWise.Web.ViewModels.Product;

public class ProductViewModel
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Sku { get; set; }
    public decimal SellingPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public string? Unit { get; set; }
}
