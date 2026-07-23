using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Expense;

namespace SellWise.Web.Controllers;

[Authorize]
public class ExpenseController : BaseController
{
    public ExpenseController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index(int days = 0, int page = 1)
    {
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();
        

        var query = Db.Expenses.Where(e => e.StoreId == storeId);

        if (days > 0)
        {
            var cutoff = DateTime.UtcNow.AddDays(-days);
            query = query.Where(e => e.ExpenseDate >= cutoff);
        }

        int pageSize = 20;
        int totalItems = await query.CountAsync();
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new ExpenseViewModel
            {
                Id = e.Id,
                Category = e.Category,
                Amount = e.Amount,
                ExpenseDate = e.ExpenseDate,
                Notes = e.Notes
            })
            .ToListAsync();

        ViewData["CurrentPage"] = page;
        ViewData["TotalPages"] = totalPages;
        ViewData["Days"] = days;
        ViewData["TotalItems"] = totalItems;

        return View("Index", expenses);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ExpenseCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            ViewData["ShowExpenseModal"] = true;
            ViewData["NewExpense"] = model;
            return await Index(0, 1);
        }
        var storeId = GetCurrentStoreId();


        var expense = new Expense
        {
            StoreId = storeId,
            Category = model.Category!,
            Amount = model.Amount,
            ExpenseDate = model.ExpenseDate,
            Notes = model.Notes,
            CreatedAt = DateTime.UtcNow
        };

        Db.Expenses.Add(expense);
        await Db.SaveChangesAsync();

        return RedirectToAction(nameof(Index));
    }
}
