using System;
using System.Threading.Tasks;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Expense;

namespace SellWise.Web.Services;

public class ExpenseService : IExpenseService
{
    private readonly AppDbContext _db;

    public ExpenseService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateExpenseAsync(Guid storeId, ExpenseCreateViewModel model)
    {
        var expense = new Expense
        {
            StoreId = storeId,
            Category = model.Category!,
            Amount = model.Amount,
            ExpenseDate = model.ExpenseDate,
            Notes = model.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
    }
}