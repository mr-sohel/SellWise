using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Product;
using SellWise.Web.Models;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
public class ProductController : BaseController
{
    private readonly IProductService _productService;

    public ProductController(AppDbContext db, IProductService productService) : base(db)
    {
        _productService = productService;
    }

    public async Task<IActionResult> Index(string search, int page = 1)
    {
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var query = Db.Products.Where(p => p.StoreId == storeId && p.IsActive);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.Name!.Contains(search) || p.Sku!.Contains(search));
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

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ProductFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        await _productService.CreateProductAsync(storeId, model);

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
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, ProductFormViewModel model)
    {
        if (id != model.Id)
            return BadRequest();

        if (!ModelState.IsValid)
            return View(model);

        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        try
        {
            await _productService.UpdateProductAsync(storeId, id, model);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        await _productService.DeleteProductAsync(storeId, id);

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
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

        var result = await _productService.BulkImportAsync(storeId, file);
        if (result.Error != null)
        {
            TempData["ErrorMessage"] = result.Error;
        }
        else if (result.Count > 0)
        {
            TempData["SuccessMessage"] = $"Successfully imported {result.Count} products.";
        }

        return RedirectToAction(nameof(Index));
    }
}