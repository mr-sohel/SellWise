using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Services;
using SellWise.Web.ViewModels.Customer;

namespace SellWise.Web.Controllers;

public class CustomerController : BaseController
{
    private const int PageSize = 20;
    private readonly ICustomerService _customerService;

    public CustomerController(AppDbContext db, ICustomerService customerService) : base(db)
    {
        _customerService = customerService;
    }

    public async Task<IActionResult> Index(string search, string sort, int page = 1)
    {
        page = Math.Max(1, page);
        var query = Db.Customers.Where(c => c.StoreId == StoreId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Name.Contains(search)
                || (c.Phone != null && c.Phone.Contains(search))
                || (c.Email != null && c.Email.Contains(search)));
        }

        query = sort?.ToLower() switch
        {
            "name_asc" => query.OrderBy(c => c.Name),
            "name_desc" => query.OrderByDescending(c => c.Name),
            "spent_desc" => query.OrderByDescending(c => c.TotalSpent),
            "spent_asc" => query.OrderBy(c => c.TotalSpent),
            "orders_desc" => query.OrderByDescending(c => c.TotalOrders),
            "orders_asc" => query.OrderBy(c => c.TotalOrders),
            "recent_desc" => query.OrderByDescending(c => c.LastOrderDate),
            "recent_asc" => query.OrderBy(c => c.LastOrderDate),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        int totalItems = await query.CountAsync();

        var customers = await query
            .Skip((page - 1) * PageSize)
            .Take(PageSize)
            .Select(c => new CustomerViewModel
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                TotalOrders = c.TotalOrders,
                TotalSpent = c.TotalSpent,
                LastOrderDate = c.LastOrderDate
            })
            .ToListAsync();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = (int)Math.Ceiling(totalItems / (double)PageSize);
        ViewData["Search"] = search;
        ViewData["Sort"] = sort;
        ViewData["TotalItems"] = totalItems;

        return View(customers);
    }

    [HttpGet]
    public IActionResult Create() => View(new CustomerCreateViewModel());

    [HttpPost]
    public async Task<IActionResult> Create(CustomerCreateViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        await _customerService.CreateCustomerAsync(StoreId, model);
        TempData["SuccessMessage"] = $"Customer \"{model.Name}\" created successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Edit(Guid id)
    {
        var customer = await Db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.StoreId == StoreId);
        if (customer == null)
            return NotFound();

        return View(new CustomerEditViewModel
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address
        });
    }

    [HttpPost]
    public async Task<IActionResult> Edit(Guid id, CustomerEditViewModel model)
    {
        if (id != model.Id)
            return BadRequest();

        if (!ModelState.IsValid)
            return View(model);

        var updated = await _customerService.UpdateCustomerAsync(StoreId, id, model);
        if (!updated)
            return NotFound();

        TempData["SuccessMessage"] = $"Customer \"{model.Name}\" updated successfully.";
        return RedirectToAction(nameof(Index));
    }
}
