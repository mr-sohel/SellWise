using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
        var product = new Product
        {
            StoreId = storeId,
            Name = model.Name!,
            Sku = model.Sku,
            Category = model.Category!,
            CostPrice = model.CostPrice,
            SellingPrice = model.SellingPrice,
            StockQuantity = model.StockQuantity,
            LowStockThreshold = model.LowStockThreshold,
            Unit = model.Unit!,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> UpdateProductAsync(Guid storeId, Guid id, ProductFormViewModel model)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        if (product == null) return false;

        product.Name = model.Name!;
        product.Sku = model.Sku;
        product.Category = model.Category!;
        product.CostPrice = model.CostPrice;
        product.SellingPrice = model.SellingPrice;
        product.StockQuantity = model.StockQuantity;
        product.LowStockThreshold = model.LowStockThreshold;
        product.Unit = model.Unit!;
        product.UpdatedAt = DateTime.UtcNow;

        // Auto-dismiss low stock alerts if stock is now above threshold
        if (product.StockQuantity > product.LowStockThreshold)
        {
            var alertsToRemove = await _db.Alerts
                .Where(a => a.StoreId == storeId && a.ProductId == id)
                .ToListAsync();
            if (alertsToRemove.Any())
            {
                _db.Alerts.RemoveRange(alertsToRemove);
            }
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<(bool Success, int NewStock, string Message)> RestockProductAsync(Guid storeId, Guid productId, int quantity)
    {
        if (quantity <= 0)
        {
            return (false, 0, "Restock quantity must be greater than zero.");
        }

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == productId && p.StoreId == storeId);
        if (product == null)
        {
            return (false, 0, "Product not found.");
        }

        product.StockQuantity += quantity;
        product.UpdatedAt = DateTime.UtcNow;

        // Auto-dismiss low stock alerts if stock is now above threshold
        if (product.StockQuantity > product.LowStockThreshold)
        {
            var alertsToRemove = await _db.Alerts
                .Where(a => a.StoreId == storeId && a.ProductId == productId)
                .ToListAsync();
            if (alertsToRemove.Any())
            {
                _db.Alerts.RemoveRange(alertsToRemove);
            }
        }

        await _db.SaveChangesAsync();

        return (true, product.StockQuantity, $"Successfully restocked {quantity} {product.Unit}. New stock: {product.StockQuantity} {product.Unit}.");
    }

    public async Task DeleteProductAsync(Guid storeId, Guid id)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        if (product != null)
        {
            product.IsActive = false;
            await _db.SaveChangesAsync();
        }
    }
}