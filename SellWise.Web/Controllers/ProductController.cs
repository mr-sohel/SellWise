using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Linq;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Product;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

[Authorize]
public class ProductController : BaseController
{
    public ProductController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var products = await Db.Products
            .Where(p => p.StoreId == storeId && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
            
        return View(products);
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View(new ProductFormViewModel());
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProductFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        var storeId = GetCurrentStoreId();
        
        var product = new Product
        {
            StoreId = storeId,
            Name = model.Name,
            NameBn = model.NameBn,
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
        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        
        if (product == null)
            return NotFound();

        var model = new ProductFormViewModel
        {
            Id = product.Id,
            Name = product.Name,
            NameBn = product.NameBn,
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
        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        
        if (product == null)
            return NotFound();

        product.Name = model.Name;
        product.NameBn = model.NameBn;
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

    [HttpPost]
    public async Task<IActionResult> Delete(Guid id)
    {
        var storeId = GetCurrentStoreId();
        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
        
        if (product != null)
        {
            product.IsActive = false; // Soft delete
            await Db.SaveChangesAsync();
        }
        
        return RedirectToAction(nameof(Index));
    }
}
