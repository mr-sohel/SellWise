using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.Services;
using SellWise.Web.ViewModels.Order;

namespace SellWise.Web.Controllers;

public class OrderController : BaseController
{
    private const int PageSize = 20;
    private readonly IOrderService _orderService;
    private readonly UserManager<ApplicationUser> _userManager;

    public OrderController(AppDbContext db, IOrderService orderService, UserManager<ApplicationUser> userManager) : base(db)
    {
        _orderService = orderService;
        _userManager = userManager;
    }

    public async Task<IActionResult> Index(string search, string status, string dateRange, int page = 1)
    {
        page = Math.Max(1, page);

        var query = Db.Orders
            .Include(o => o.Customer)
            .Where(o => o.StoreId == StoreId);

        var today = DateTime.UtcNow.Date;
        query = dateRange switch
        {
            "today" => query.Where(o => o.OrderDate >= today),
            "yesterday" => query.Where(o => o.OrderDate >= today.AddDays(-1) && o.OrderDate < today),
            "week" => query.Where(o => o.OrderDate >= today.AddDays(-7)),
            "month" => query.Where(o => o.OrderDate >= today.AddMonths(-1)),
            _ => query
        };

        if (!string.IsNullOrEmpty(search))
            query = query.Where(o => o.OrderNumber.Contains(search) || (o.Customer != null && o.Customer.Name.Contains(search)));

        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(o => o.Status == status.ToLower());

        var kpis = await _orderService.GetDashboardKpisAsync(StoreId);
        ViewBag.TodayRevenue = kpis.TodayRevenue;
        ViewBag.TodayOrdersCount = kpis.TodayOrdersCount;
        ViewBag.PendingOrdersCount = kpis.PendingOrdersCount;

        int totalItems = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * PageSize)
            .Take(PageSize)
            .Select(o => new OrderViewModel
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer != null ? o.Customer.Name : null,
                CustomerPhone = o.Customer != null ? o.Customer.Phone : null,
                OrderDate = o.OrderDate,
                Total = o.Total,
                Status = o.Status,
                OrderType = o.OrderType,
                SalespersonName = o.SalespersonName
            })
            .ToListAsync();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = (int)Math.Ceiling(totalItems / (double)PageSize);
        ViewData["Search"] = search;
        ViewData["Status"] = status ?? "all";
        ViewData["DateRange"] = dateRange ?? "all";
        ViewData["TotalItems"] = totalItems;

        return View(orders);
    }

    [HttpGet]
    public async Task<IActionResult> Details(Guid id)
    {
        var vm = await GetOrderDetailsAsync(id);
        return vm == null ? RedirectToAction(nameof(Index)) : View(vm);
    }

    [HttpGet]
    public async Task<IActionResult> Invoice(Guid id)
    {
        var vm = await GetOrderDetailsAsync(id);
        return vm == null ? RedirectToAction(nameof(Index)) : View(vm);
    }

    [HttpPost]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var error = await _orderService.ChangeOrderStatusAsync(id, StoreId, "cancelled");
        if (error != null) TempData["ErrorMessage"] = error;
        else TempData["SuccessMessage"] = "Order cancelled successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> ChangeStatus(Guid id, string status)
    {
        var error = await _orderService.ChangeOrderStatusAsync(id, StoreId, status);
        if (error != null) TempData["ErrorMessage"] = error;
        else TempData["SuccessMessage"] = $"Order status changed to {status}.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        return View(await PopulateOrderFormAsync(new OrderFormViewModel { IdempotencyKey = Guid.NewGuid() }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(OrderFormViewModel model)
    {
        if (!model.Items.Any(i => i.ProductId != Guid.Empty))
            ModelState.AddModelError("", "Please add at least one product to the order.");

        if (ModelState.IsValid)
        {
            var user = await _userManager.GetUserAsync(User);
            var salespersonName = !string.IsNullOrWhiteSpace(user?.OwnerName) ? user.OwnerName : user?.UserName;

            var error = await _orderService.CreateOrderAsync(StoreId, model, salespersonName);
            if (error == null)
                return RedirectToAction(nameof(Index));

            ModelState.AddModelError("", error);
        }

        return View(await PopulateOrderFormAsync(model));
    }

    private async Task<OrderDetailsViewModel?> GetOrderDetailsAsync(Guid id)
    {
        var order = await Db.Orders
            .Include(o => o.Store)
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.StoreId == StoreId);

        if (order == null) return null;

        return new OrderDetailsViewModel
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            OrderType = order.OrderType,
            SalespersonName = order.SalespersonName,
            OrderDate = order.OrderDate,
            Total = order.Total,
            DeliveryCharge = order.DeliveryCharge,
            Discount = order.Discount,
            Notes = order.Notes,
            CustomerName = order.Customer?.Name,
            CustomerPhone = order.Customer?.Phone,
            CustomerEmail = order.Customer?.Email,
            CustomerAddress = order.Customer?.Address,
            StoreName = order.Store.Name,
            Currency = order.Store.Currency,
            Items = order.Items.Select(i => new OrderDetailItemViewModel
            {
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice
            }).ToList()
        };
    }

    /// <summary>The POS screen is a client-side app; products and customers are embedded as JSON.</summary>
    private async Task<OrderFormViewModel> PopulateOrderFormAsync(OrderFormViewModel model)
    {
        var products = await Db.Products
            .AsNoTracking()
            .Where(p => p.StoreId == StoreId && p.IsActive)
            .Select(p => new
            {
                id = p.Id,
                name = p.Name,
                sku = p.Sku,
                category = p.Category ?? "Uncategorized",
                sellingPrice = p.SellingPrice,
                stockQuantity = p.StockQuantity
            })
            .ToListAsync();

        var customers = await Db.Customers
            .AsNoTracking()
            .Where(c => c.StoreId == StoreId)
            .Select(c => new { id = c.Id, name = c.Name, phone = c.Phone })
            .ToListAsync();

        model.ProductsJson = System.Text.Json.JsonSerializer.Serialize(products);
        model.CustomersJson = System.Text.Json.JsonSerializer.Serialize(customers);
        return model;
    }
}
