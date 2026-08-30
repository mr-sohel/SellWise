using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Expense;
using SellWise.Web.Services;

namespace SellWise.Web.Controllers;

[Authorize]
public class ExpenseController : BaseController
{
    private readonly IExpenseService _expenseService;

    public ExpenseController(AppDbContext db, IExpenseService expenseService) : base(db)
    {
        _expenseService = expenseService;
    }

    public async Task<IActionResult> Index(int days = 0, int page = 1)
    {
        if (page < 1) page = 1;
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        if (await IsEmployeeAsync(storeId))
        {
            TempData["ErrorMessage"] = "Employees are not permitted to access expenses.";
            return RedirectToAction("Index", "Order");
        }

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
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ExpenseCreateViewModel model)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");
        if (await IsEmployeeAsync(storeId))
        {
            TempData["ErrorMessage"] = "Employees are not permitted to add expenses.";
            return RedirectToAction(nameof(Index));
        }

        if (!ModelState.IsValid)
        {
            ViewData["ShowExpenseModal"] = true;
            ViewData["NewExpense"] = model;
            return await Index(0, 1);
        }

        await _expenseService.CreateExpenseAsync(storeId, model);

        return RedirectToAction(nameof(Index));
    }
}
