using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Product;

namespace SellWise.Web.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateProductAsync(Guid storeId, ProductFormViewModel model)
    {
        _db.Products.Add(new Product
        {
            StoreId = storeId,
            Name = model.Name!.Trim(),
            Sku = model.Sku?.Trim(),
            Category = model.Category?.Trim(),
            CostPrice = model.CostPrice,
            SellingPrice = model.SellingPrice,
            StockQuantity = model.StockQuantity,
            LowStockThreshold = model.LowStockThreshold,
            Unit = string.IsNullOrWhiteSpace(model.Unit) ? "pcs" : model.Unit.Trim()
        });
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Updates product details. Stock is intentionally not editable here: it only changes
    /// through sales and restocks, so saving an old form can't overwrite sales made meanwhile.
    /// </summary>
    public async Task<bool> UpdateProductAsync(Guid storeId, Guid id, ProductFormViewModel model)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        if (product == null) return false;

        product.Name = model.Name!.Trim();
        product.Sku = model.Sku?.Trim();
        product.Category = model.Category?.Trim();
        product.CostPrice = model.CostPrice;
        product.SellingPrice = model.SellingPrice;
        product.LowStockThreshold = model.LowStockThreshold;
        product.Unit = string.IsNullOrWhiteSpace(model.Unit) ? "pcs" : model.Unit.Trim();
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>Soft delete: past orders keep pointing at the product for reporting.</summary>
    public async Task DeleteProductAsync(Guid storeId, Guid id)
    {
        await _db.Products
            .Where(p => p.Id == id && p.StoreId == storeId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.IsActive, false));
    }

    public async Task<(bool Success, int NewStock, string Message)> RestockProductAsync(Guid storeId, Guid productId, int quantity)
    {
        if (quantity <= 0)
            return (false, 0, "Restock quantity must be greater than zero.");

        // Atomic increment so a restock and a sale at the same time don't overwrite each other.
        var updatedRows = await _db.Products
            .Where(p => p.Id == productId && p.StoreId == storeId && p.IsActive)
            .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.StockQuantity, p => p.StockQuantity + quantity)
                .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));

        if (updatedRows == 0)
            return (false, 0, "Product not found.");

        var product = await _db.Products.AsNoTracking()
            .Where(p => p.Id == productId)
            .Select(p => new { p.StockQuantity, p.LowStockThreshold, p.Unit })
            .FirstAsync();

        if (product.StockQuantity > product.LowStockThreshold)
        {
            await _db.Alerts
                .Where(a => a.StoreId == storeId && a.ProductId == productId)
                .ExecuteDeleteAsync();
        }

        return (true, product.StockQuantity, $"Added {quantity} {product.Unit}. New stock: {product.StockQuantity} {product.Unit}.");
    }
}
