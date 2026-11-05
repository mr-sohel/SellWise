using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Services;
using SellWise.Web.ViewModels.Product;

namespace SellWise.Web.Controllers;

public class ProductController : BaseController
{
    private const int PageSize = 20;
    private readonly IProductService _productService;

    public ProductController(AppDbContext db, IProductService productService) : base(db)
    {
        _productService = productService;
    }

    public async Task<IActionResult> Index(string search, int page = 1)
    {
        page = Math.Max(1, page);
        var query = Db.Products.Where(p => p.StoreId == StoreId && p.IsActive);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.Contains(search) || (p.Sku != null && p.Sku.Contains(search)));

        int totalItems = await query.CountAsync();

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * PageSize)
            .Take(PageSize)
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
        ViewData["TotalPages"] = (int)Math.Ceiling(totalItems / (double)PageSize);
        ViewData["Search"] = search;
        ViewData["TotalItems"] = totalItems;

        return View(products);
    }

    [HttpGet, OwnerOnly]
    public IActionResult Create() => View(new ProductFormViewModel());

    [HttpPost, OwnerOnly]
    public async Task<IActionResult> Create(ProductFormViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        await _productService.CreateProductAsync(StoreId, model);
        return RedirectToAction(nameof(Index));
    }

    [HttpGet, OwnerOnly]
    public async Task<IActionResult> Edit(Guid id)
    {
        var product = await Db.Products.FirstOrDefaultAsync(p => p.Id == id && p.StoreId == StoreId);
        if (product == null)
            return NotFound();

        return View(new ProductFormViewModel
        {
            Id = product.Id,
            Name = product.Name,
            Sku = product.Sku,
            Category = product.Category,
            CostPrice = product.CostPrice,
            SellingPrice = product.SellingPrice,
            StockQuantity = product.StockQuantity,
            LowStockThreshold = product.LowStockThreshold,
            Unit = product.Unit,
            Version = product.Version
        });
    }

    [HttpPost, OwnerOnly]
    public async Task<IActionResult> Edit(Guid id, ProductFormViewModel model)
    {
        if (id != model.Id)
            return BadRequest();

        if (!ModelState.IsValid)
            return View(model);

        switch (await _productService.UpdateProductAsync(StoreId, id, model))
        {
            case UpdateResult.NotFound:
                return NotFound();
            case UpdateResult.Conflict:
                ModelState.AddModelError(string.Empty,
                    "Someone else saved this product while you were editing. Reload the page to see their changes, then edit again.");
                return View(model);
            default:
                return RedirectToAction(nameof(Index));
        }
    }

    [HttpPost, OwnerOnly]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _productService.DeleteProductAsync(StoreId, id);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost, OwnerOnly]
    public async Task<IActionResult> Restock(Guid productId, int quantity)
    {
        var result = await _productService.RestockProductAsync(StoreId, productId, quantity);
        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });

        return Json(new { success = true, productId, newStock = result.NewStock, message = result.Message });
    }
}
