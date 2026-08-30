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

    public async Task UpdateProductAsync(Guid storeId, Guid id, ProductFormViewModel model)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        if (product == null) throw new InvalidOperationException("Product not found.");

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

    public async Task<(int Count, string? Error)> BulkImportAsync(Guid storeId, IFormFile file)
    {
        try
        {
            using var reader = new StreamReader(file.OpenReadStream());
            var isFirstRow = true;
            var productsToAdd = new List<Product>();

            string? line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                if (isFirstRow)
                {
                    isFirstRow = false; // Skip header row
                    continue;
                }

                var values = ParseCsvLine(line);

                if (values.Length >= 8)
                {
                    bool validCost = decimal.TryParse(values[3].Trim(), out var cp);
                    bool validSelling = decimal.TryParse(values[4].Trim(), out var sp);
                    bool validStock = int.TryParse(values[5].Trim(), out var sq);
                    bool validThreshold = int.TryParse(values[6].Trim(), out var lst);

                    if (!validCost || !validSelling || !validStock || !validThreshold)
                    {
                        return (0, "CSV contains malformed numerical data. Import aborted.");
                    }

                    productsToAdd.Add(new Product
                    {
                        StoreId = storeId,
                        Name = values[0].Trim(),
                        Sku = values[1].Trim(),
                        Category = values[2].Trim(),
                        CostPrice = cp,
                        SellingPrice = sp,
                        StockQuantity = sq,
                        LowStockThreshold = lst,
                        Unit = values[7].Trim(),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            if (productsToAdd.Any())
            {
                _db.Products.AddRange(productsToAdd);
                await _db.SaveChangesAsync();
                return (productsToAdd.Count, null);
            }

            return (0, null);
        }
        catch (Exception)
        {
            return (0, "An error occurred while processing the CSV file. Please ensure it is correctly formatted.");
        }
    }

    private string[] ParseCsvLine(string line)
    {
        var result = new List<string>();
        bool inQuotes = false;
        var currentField = new System.Text.StringBuilder();

        foreach (char c in line)
        {
            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(currentField.ToString());
                currentField.Clear();
            }
            else
            {
                currentField.Append(c);
            }
        }
        result.Add(currentField.ToString());
        return result.ToArray();
    }
}