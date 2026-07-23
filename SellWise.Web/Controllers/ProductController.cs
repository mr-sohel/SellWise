using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Product;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

// [Authorize] ensures security by forcing users to be logged in. 
// BaseController provides GetCurrentStoreId() for tenant isolation (so sellers only see their own products).
[Authorize]
public class ProductController : BaseController
{
    // Inject the Entity Framework Core database context
    public ProductController(AppDbContext db) : base(db) { }

    // READ: Displays a paginated and searchable list of products.
    public async Task<IActionResult> Index(string search, int page = 1)
    {
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var query = Db.Products.Where(p => p.StoreId == storeId && p.IsActive);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.Name.Contains(search) || p.Sku.Contains(search));
        }

        int pageSize = 20;
        int totalItems = await query.CountAsync();
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductViewModel
            {
                Id = p.Id,
                Name = p.Name,
                Sku = p.Sku,
                SellingPrice = p.SellingPrice,
                StockQuantity = p.StockQuantity,
                LowStockThreshold = p.LowStockThreshold,
                Unit = p.Unit
            })
            .ToListAsync();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["Search"] = search;
        ViewData["TotalItems"] = totalItems;

        return View(products);
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View(new ProductFormViewModel());
    }

    // CREATE: Handles the form submission to add a new product.
    [HttpPost]
    public async Task<IActionResult> Create(ProductFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        
        var product = new Product
        {
            StoreId = storeId,
            Name = model.Name,
            Sku = model.Sku,
            Category = model.Category,
            CostPrice = model.CostPrice,
            SellingPrice = model.SellingPrice,
            StockQuantity = model.StockQuantity,
            LowStockThreshold = model.LowStockThreshold,
            Unit = model.Unit,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        Db.Products.Add(product);
        await Db.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Edit(Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        
        if (product == null)
            return NotFound();

        var model = new ProductFormViewModel
        {
            Id = product.Id,
            Name = product.Name,
            Sku = product.Sku,
            Category = product.Category,
            CostPrice = product.CostPrice,
            SellingPrice = product.SellingPrice,
            StockQuantity = product.StockQuantity,
            LowStockThreshold = product.LowStockThreshold,
            Unit = product.Unit
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(Guid id, ProductFormViewModel model)
    {
        if (id != model.Id)
            return BadRequest();

        if (!ModelState.IsValid)
            return View(model);

        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        
        if (product == null)
            return NotFound();

        product.Name = model.Name;
        product.Sku = model.Sku;
        product.Category = model.Category;
        product.CostPrice = model.CostPrice;
        product.SellingPrice = model.SellingPrice;
        product.StockQuantity = model.StockQuantity;
        product.LowStockThreshold = model.LowStockThreshold;
        product.Unit = model.Unit;
        product.UpdatedAt = DateTime.UtcNow;

        await Db.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    // DELETE: Removes a product.
    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);

        if (product != null)
        {
            // SOFT DELETE: We set IsActive = false instead of deleting the row from the database.
            // This preserves historical order data that references this product.
            product.IsActive = false; 
            await Db.SaveChangesAsync();
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> BulkImport(IFormFile file)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        if (file == null || file.Length == 0)
        {
            TempData["ErrorMessage"] = "Please select a valid CSV file.";
            return RedirectToAction(nameof(Index));
        }

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

                // Basic validation: ensure we have enough columns
                if (values.Length >= 8)
                {
                    bool validCost = decimal.TryParse(values[3].Trim(), out var cp);
                    bool validSelling = decimal.TryParse(values[4].Trim(), out var sp);
                    bool validStock = int.TryParse(values[5].Trim(), out var sq);
                    bool validThreshold = int.TryParse(values[6].Trim(), out var lst);

                    if (!validCost || !validSelling || !validStock || !validThreshold)
                    {
                        TempData["ErrorMessage"] = "CSV contains malformed numerical data. Import aborted.";
                        return RedirectToAction(nameof(Index));
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
                Db.Products.AddRange(productsToAdd);
                await Db.SaveChangesAsync();
                TempData["SuccessMessage"] = $"Successfully imported {productsToAdd.Count} products.";
            }
        }
        catch (Exception)
        {
            // Avoid exposing exception details to the end-user (Information Disclosure)
            TempData["ErrorMessage"] = "An error occurred while processing the CSV file. Please ensure it is correctly formatted.";
        }

        return RedirectToAction(nameof(Index));
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
