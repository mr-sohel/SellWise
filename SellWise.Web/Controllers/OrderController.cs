using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Order;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
public class OrderController : BaseController
{
    private readonly IOrderService _orderService;

    public OrderController(AppDbContext db, IOrderService orderService) : base(db)
    {
        _orderService = orderService;
    }

    public async Task<IActionResult> Index(string search, string status, int page = 1)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var query = Db.Orders
            .Include(o => o.Customer)
            .Where(o => o.StoreId == storeId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(o => o.OrderNumber.Contains(search) || (o.Customer != null && o.Customer.Name.Contains(search)));
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status == status.ToLower());
        }

        int pageSize = 20;
        int totalItems = await query.CountAsync();
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderViewModel
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer != null ? o.Customer.Name : null,
                CustomerPhone = o.Customer != null ? o.Customer.Phone : null,
                OrderDate = o.OrderDate,
                Total = o.Total,
                Status = o.Status
            })
            .ToListAsync();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["Search"] = search;
        ViewData["Status"] = status;
        ViewData["TotalItems"] = totalItems;

        return View(orders);
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        var storeId = GetCurrentStoreId();
        var products = await Db.Products.Where(p => p.StoreId == storeId && p.IsActive).ToListAsync();
        var customers = await Db.Customers.Where(c => c.StoreId == storeId).ToListAsync();

        var model = new OrderFormViewModel
        {
            AvailableProducts = products.Select(p => new SelectListItem { Value = p.Id.ToString(), Text = $"{p.Name} (৳{p.SellingPrice} - Stock: {p.StockQuantity})" }),
            AvailableCustomers = customers.Select(c => new SelectListItem { Value = c.Id.ToString(), Text = c.Name })
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Create(OrderFormViewModel model)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        if (!model.Items.Any() || model.Items.All(i => i.ProductId == Guid.Empty))
        {
            ModelState.AddModelError("", "Please add at least one product to the order.");
        }

        if (ModelState.IsValid)
        {
            var error = await _orderService.CreateOrderAsync(storeId, model);
            if (error == null)
            {
                return RedirectToAction(nameof(Index));
            }
            ModelState.AddModelError("", error);
        }

        return await RepopulateAndReturn(model, storeId);
    }

    private async Task<IActionResult> RepopulateAndReturn(OrderFormViewModel model, Guid storeId)
    {
        var products = await Db.Products.Where(p => p.StoreId == storeId && p.IsActive).ToListAsync();
        var customers = await Db.Customers.Where(c => c.StoreId == storeId).ToListAsync();
        model.AvailableProducts = products.Select(p => new SelectListItem { Value = p.Id.ToString(), Text = $"{p.Name} (৳{p.SellingPrice})" });
        model.AvailableCustomers = customers.Select(c => new SelectListItem { Value = c.Id.ToString(), Text = c.Name });
        return View(model);
    }
}
