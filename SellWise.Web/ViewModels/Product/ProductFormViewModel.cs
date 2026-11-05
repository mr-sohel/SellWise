using System;
using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Product;

public class ProductFormViewModel
{
    public Guid? Id { get; set; }

    /// <summary>Product.Version when the edit form was opened (optimistic concurrency).</summary>
    public int Version { get; set; }
    
    [Required]
    public string? Name { get; set; } = string.Empty;
    
    public string? Sku { get; set; }
    public string? Category { get; set; }
    
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Cost price must be greater than 0")]
    public decimal CostPrice { get; set; }
    
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Selling price must be greater than 0")]
    public decimal SellingPrice { get; set; }
    
    [Required]
    [Range(0, SellWise.Web.Services.ProductService.MaxStock)]
    public int StockQuantity { get; set; }
    
    [Range(0, 1000000)]
    public int LowStockThreshold { get; set; } = 10;
    public string? Unit { get; set; } = "pcs";
}
