using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Order;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

// [Authorize] ensures only logged-in users can access this controller.
// Inherits from BaseController which provides multi-tenancy support (GetCurrentStoreId).
[Authorize]
public class OrderController : BaseController
{
    private readonly IOrderService _orderService;

    // DEPENDENCY INJECTION: We inject AppDbContext (database) and IOrderService (business logic).
    // This keeps the controller thin, modular, and highly testable.
    public OrderController(AppDbContext db, IOrderService orderService) : base(db)
    {
        _orderService = orderService;
    }

    public async Task<IActionResult> Index(string search, string status, int page = 1)
    {
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();
        

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
    public async Task<IActionResult> Details(Guid id)
    {
        var storeId = GetCurrentStoreId();
        

        var order = await Db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.StoreId == storeId);

        if (order == null) return RedirectToAction(nameof(Index));

        var vm = new OrderDetailsViewModel
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            OrderDate = order.OrderDate,
            Total = order.Total,
            DeliveryCharge = order.DeliveryCharge,
            Discount = order.Discount,
            Notes = order.Notes,
            CustomerName = order.Customer?.Name,
            CustomerPhone = order.Customer?.Phone,
            Items = order.Items.Select(i => new OrderDetailItemViewModel
            {
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice
            }).ToList()
        };

        return View(vm);
    }

    // Action to handle Order Cancellation.
    // [ValidateAntiForgeryToken] prevents Cross-Site Request Forgery (CSRF) attacks.
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var storeId = GetCurrentStoreId();
        var error = await _orderService.ChangeOrderStatusAsync(id, storeId, "cancelled");
        if (error != null) TempData["ErrorMessage"] = error;
        else TempData["SuccessMessage"] = "Order cancelled successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangeStatus(Guid id, string status)
    {
        var storeId = GetCurrentStoreId();
        var error = await _orderService.ChangeOrderStatusAsync(id, storeId, status);
        if (error != null) TempData["ErrorMessage"] = error;
        else TempData["SuccessMessage"] = $"Order status changed to {status.Replace("_", " ")}.";
        return RedirectToAction(nameof(Index));
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

    [HttpPost]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> BulkImport(IFormFile file)
    {
        var storeId = GetCurrentStoreId();
        

        if (file == null || file.Length == 0)
        {
            TempData["ErrorMessage"] = "Please select a valid CSV file.";
            return RedirectToAction(nameof(Index));
        }

        try
        {
            using var reader = new StreamReader(file.OpenReadStream());
            var isFirstRow = true;
            var ordersToAdd = new List<Order>();

            // Fix ToDictionary duplicate key error by grouping by phone and selecting the first
            var customerList = await Db.Customers.Where(c => c.StoreId == storeId && !string.IsNullOrEmpty(c.Phone)).ToListAsync();
            var existingCustomers = customerList.GroupBy(c => c.Phone!).ToDictionary(g => g.Key, g => g.First());

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

                // CSV Format: OrderNumber,CustomerName,CustomerPhone,Total,Status,OrderDate
                if (values.Length >= 6)
                {
                    var phone = values[2].Trim();
                    Customer? customer = null;
                    if (!string.IsNullOrEmpty(phone))
                    {
                        if (existingCustomers.ContainsKey(phone))
                        {
                            customer = existingCustomers[phone];
                        }
                        else
                        {
                            customer = new Customer
                            {
                                StoreId = storeId,
                                Name = string.IsNullOrEmpty(values[1].Trim()) ? "Unknown" : values[1].Trim(),
                                Phone = phone,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            Db.Customers.Add(customer);
                            existingCustomers[phone] = customer;
                        }
                    }

                    var total = decimal.TryParse(values[3], out var parsedTotal) ? parsedTotal : 0;

                    if (customer != null)
                    {
                        customer.TotalOrders++;
                        customer.TotalSpent += total;
                        customer.UpdatedAt = DateTime.UtcNow;
                    }

                    ordersToAdd.Add(new Order
                    {
                        StoreId = storeId,
                        OrderNumber = values[0].Trim(),
                        Customer = customer,
                        Total = total,
                        Status = string.IsNullOrEmpty(values[4].Trim()) ? "pending" : values[4].Trim().ToLower(),
                        OrderDate = values.Length >= 7 && DateTime.TryParse(values[6].Trim(), out var date) ? date : DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }

            if (ordersToAdd.Any())
            {
                Db.Orders.AddRange(ordersToAdd);
                await Db.SaveChangesAsync();
                TempData["SuccessMessage"] = $"Successfully imported {ordersToAdd.Count} orders.";
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
