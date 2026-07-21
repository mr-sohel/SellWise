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
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var query = Db.Customers.Where(c => c.StoreId == storeId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Name.Contains(search) || c.Phone.Contains(search) || c.Email.Contains(search));
        }

        if (!string.IsNullOrEmpty(segment))
        {
            if (segment.ToUpper() == "CHAMPION")
                query = query.Where(c => c.TotalSpent >= 10000000);
            else if (segment.ToUpper() == "POTENTIAL")
                query = query.Where(c => c.TotalSpent >= 5000000 && c.TotalSpent < 10000000);
            else if (segment.ToUpper() == "PROMISING")
                query = query.Where(c => c.TotalSpent < 5000000);
        }

        int pageSize = 20;
        int totalItems = await query.CountAsync();
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var customers = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["Search"] = search;
        ViewData["Segment"] = segment;
        ViewData["TotalItems"] = totalItems;

        return View(customers);
    }
}
