using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Product;

namespace SellWise.Web.Services;

public enum UpdateResult { Updated, NotFound, Conflict }

public class ProductService : IProductService
{
    public const int MaxStock = 1_000_000;
    public const int MaxRestockQuantity = 100_000;

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
    /// Updates product details with optimistic concurrency: the form carries the Version it was
    /// opened with, and the UPDATE only succeeds if nobody saved a newer version in between
    /// (EF adds "WHERE Version = @original"). Stock is not editable here; it only changes through
    /// sales and restocks.
    /// </summary>
    public async Task<UpdateResult> UpdateProductAsync(Guid storeId, Guid id, ProductFormViewModel model)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        if (product == null) return UpdateResult.NotFound;

        _db.Entry(product).Property(p => p.Version).OriginalValue = model.Version;
        product.Version = model.Version + 1;

        product.Name = model.Name!.Trim();
        product.Sku = model.Sku?.Trim();
        product.Category = model.Category?.Trim();
        product.CostPrice = model.CostPrice;
        product.SellingPrice = model.SellingPrice;
        product.LowStockThreshold = model.LowStockThreshold;
        product.Unit = string.IsNullOrWhiteSpace(model.Unit) ? "pcs" : model.Unit.Trim();
        product.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
            return UpdateResult.Updated;
        }
        catch (DbUpdateConcurrencyException)
        {
            return UpdateResult.Conflict;
        }
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
        if (quantity is <= 0 or > MaxRestockQuantity)
            return (false, 0, $"Restock quantity must be between 1 and {MaxRestockQuantity:N0}.");

        // Atomic increment so a restock and a sale at the same time don't overwrite each other.
        // The stock cap also keeps the int column from overflowing.
        var updatedRows = await _db.Products
            .Where(p => p.Id == productId && p.StoreId == storeId && p.IsActive && p.StockQuantity <= MaxStock - quantity)
            .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.StockQuantity, p => p.StockQuantity + quantity)
                .SetProperty(p => p.UpdatedAt, DateTime.UtcNow));

        if (updatedRows == 0)
            return (false, 0, $"Product not found, or stock would exceed {MaxStock:N0}.");

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
