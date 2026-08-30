using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Customer;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
public class CustomerController : BaseController
{
    private readonly IRfmService _rfmService;
    private readonly ICustomerService _customerService;

    public CustomerController(AppDbContext db, IRfmService rfmService, ICustomerService customerService) : base(db)
    {
        _rfmService = rfmService;
        _customerService = customerService;
    }

    public async Task<IActionResult> Index(string search, string segment, string sort, int page = 1)
    {
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();


        var query = Db.Customers.Where(c => c.StoreId == storeId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Name!.Contains(search) || c.Phone!.Contains(search) || c.Email!.Contains(search));
        }

        if (!string.IsNullOrEmpty(segment))
        {
            var segmentFilter = segment.ToUpper() switch
            {
                "CHAMPION" => "Champion",
                "LOYAL" => "Loyal",
                "POTENTIAL_LOYALIST" => "Potential Loyalist",
                "NEW_CUSTOMER" => "New Customer",
                "AT_RISK" => "At Risk",
                "CANT_LOSE_THEM" => "Can't Lose Them",
                "NEED_ATTENTION" => "Need Attention",
                "LOST" => "Lost",
                _ => null
            };

            if (segmentFilter != null)
                query = query.Where(c => c.RfmSegment == segmentFilter);
        }

        query = sort?.ToLower() switch
        {
            "name_asc" => query.OrderBy(c => c.Name),
            "name_desc" => query.OrderByDescending(c => c.Name),
            "spent_desc" => query.OrderByDescending(c => c.TotalSpent),
            "spent_asc" => query.OrderBy(c => c.TotalSpent),
            "orders_desc" => query.OrderByDescending(c => c.TotalOrders),
            "orders_asc" => query.OrderBy(c => c.TotalOrders),
            "rfm_desc" => query.OrderByDescending(c => c.RecencyScore * 100 + c.FrequencyScore * 10 + c.MonetaryScore),
            "rfm_asc" => query.OrderBy(c => c.RecencyScore * 100 + c.FrequencyScore * 10 + c.MonetaryScore),
            "recent_desc" => query.OrderByDescending(c => c.LastOrderDate),
            "recent_asc" => query.OrderBy(c => c.LastOrderDate),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        int pageSize = 20;
        int totalItems = await query.CountAsync();
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var customers = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerViewModel
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                TotalOrders = c.TotalOrders,
                TotalSpent = c.TotalSpent,
                RecencyScore = c.RecencyScore,
                FrequencyScore = c.FrequencyScore,
                MonetaryScore = c.MonetaryScore,
                RfmSegment = c.RfmSegment
            })
            .ToListAsync();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["Search"] = search;
        ViewData["Segment"] = segment;
        ViewData["Sort"] = sort;
        ViewData["TotalItems"] = totalItems;

        return View(customers);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RecalculateRfm()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        if (await IsEmployeeAsync(storeId))
        {
            TempData["ErrorMessage"] = "Employees are not permitted to recalculate RFM scores.";
            return RedirectToAction(nameof(Index));
        }

        await _rfmService.RecalculateAllAsync(storeId);

        TempData["SuccessMessage"] = "RFM scores recalculated successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public IActionResult Create()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        return View(new CustomerCreateViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CustomerCreateViewModel model)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        if (!ModelState.IsValid) return View(model);

        await _customerService.CreateCustomerAsync(storeId, model);
        TempData["SuccessMessage"] = $"Customer \"{model.Name}\" created successfully.";

        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> Edit(Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var customer = await Db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.StoreId == storeId);
        if (customer == null) return NotFound();

        var model = new CustomerEditViewModel
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address
        };

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, CustomerEditViewModel model)
    {
        if (id != model.Id) return BadRequest();

        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        if (!ModelState.IsValid) return View(model);

        try
        {
            await _customerService.UpdateCustomerAsync(storeId, id, model);
            TempData["SuccessMessage"] = $"Customer \"{model.Name}\" updated successfully.";
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }

        return RedirectToAction(nameof(Index));
    }
}
