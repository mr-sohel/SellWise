using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

[Authorize]
public class ExpenseController : BaseController
{
    public ExpenseController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var expenses = await Db.Expenses
            .Where(e => e.StoreId == storeId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
            
        return View(expenses);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Expense expense)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        expense.StoreId = storeId;
        expense.CreatedAt = DateTime.UtcNow;

        Db.Expenses.Add(expense);
        await Db.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }
}
