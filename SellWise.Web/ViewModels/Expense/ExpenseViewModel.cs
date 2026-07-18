using System;

namespace SellWise.Web.ViewModels.Expense;

public class ExpenseViewModel
{
    public Guid Id { get; set; }
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string? Notes { get; set; }
}
