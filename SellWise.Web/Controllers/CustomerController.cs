using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Customer;

namespace SellWise.Web.Controllers;

[Authorize]
public class CustomerController : BaseController
{
    public CustomerController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index(string search, string segment, int page = 1)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var query = Db.Customers.Where(c => c.StoreId == storeId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Name.Contains(search) || c.Phone.Contains(search) || c.Email.Contains(search));
        }

        var customers = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerViewModel
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                TotalOrders = c.TotalOrders,
                TotalSpent = c.TotalSpent
            })
            .ToListAsync();

        if (!string.IsNullOrEmpty(segment))
        {
            if (segment.ToUpper() == "CHAMPION")
                customers = customers.Where(c => c.TotalSpent >= 10000000).ToList();
            else if (segment.ToUpper() == "POTENTIAL")
                customers = customers.Where(c => c.TotalSpent >= 5000000 && c.TotalSpent < 10000000).ToList();
            else if (segment.ToUpper() == "PROMISING")
                customers = customers.Where(c => c.TotalSpent < 5000000).ToList();
        }

        int pageSize = 20;
        int totalItems = customers.Count;
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        customers = customers.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["Search"] = search;
        ViewData["Segment"] = segment;
        ViewData["TotalItems"] = totalItems;

        return View(customers);
    }

    public async Task<IActionResult> Details(Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var customer = await Db.Customers
            .Include(c => c.Orders)
            .FirstOrDefaultAsync(c => c.Id == id && c.StoreId == storeId);

        if (customer == null) return NotFound();

        return View(customer);
    }

    [HttpGet]
    public async Task<IActionResult> Edit(Guid id)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var customer = await Db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.StoreId == storeId);
        if (customer == null) return NotFound();

        return View(customer);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(Guid id, Customer customer)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        if (id != customer.Id) return BadRequest();

        if (ModelState.IsValid)
        {
            var existing = await Db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.StoreId == storeId);
            if (existing == null) return NotFound();

            existing.Name = customer.Name;
            existing.Email = customer.Email;
            existing.Phone = customer.Phone;

            await Db.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(customer);
    }
}
