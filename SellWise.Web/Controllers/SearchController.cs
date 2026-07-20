using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;

namespace SellWise.Web.Controllers;

[Authorize]
public class SearchController : BaseController
{
    public SearchController(AppDbContext db) : base(db)
    {
    }

    [HttpGet]
    public async Task<IActionResult> QuickSearch(string q)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty)
            return Json(new { success = false, message = "No active store" });

        if (string.IsNullOrWhiteSpace(q))
            return Json(new { products = new object[0], orders = new object[0], customers = new object[0] });

        q = q.ToLower().Trim();

        var products = await Db.Products
            .Where(p => p.StoreId == storeId && p.IsActive &&
                        (p.Name.ToLower().Contains(q) || (p.Sku != null && p.Sku.ToLower().Contains(q))))
            .Take(5)
            .Select(p => new {
                id = p.Id,
                name = p.Name,
                detail = p.Sku != null ? $"SKU: {p.Sku}" : "Product",
                url = $"/Product?search={Uri.EscapeDataString(p.Name)}"
            })
            .ToListAsync();

        var orders = await Db.Orders
            .Where(o => o.StoreId == storeId &&
                        (o.OrderNumber.ToLower().Contains(q) || (o.Customer != null && o.Customer.Name.ToLower().Contains(q))))
            .Take(5)
            .Select(o => new {
                id = o.Id,
                name = o.OrderNumber,
                detail = o.Status,
                url = $"/Order?search={Uri.EscapeDataString(o.OrderNumber)}"
            })
            .ToListAsync();

        var customers = await Db.Customers
            .Where(c => c.StoreId == storeId &&
                        (c.Name.ToLower().Contains(q) || (c.Phone != null && c.Phone.ToLower().Contains(q))))
            .Take(5)
            .Select(c => new {
                id = c.Id,
                name = c.Name,
                detail = c.Phone ?? "Customer",
                url = $"/Customer?search={Uri.EscapeDataString(c.Name)}"
            })
            .ToListAsync();

        return Json(new {
            products,
            orders,
            customers
        });
    }
}