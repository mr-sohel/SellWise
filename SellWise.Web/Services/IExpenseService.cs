using System;
using System.Threading.Tasks;
using SellWise.Web.ViewModels.Expense;

namespace SellWise.Web.Services;

public interface IExpenseService
{
    Task CreateExpenseAsync(Guid storeId, ExpenseCreateViewModel model);
}