using System;
using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Expense;

public class ExpenseCreateViewModel
{
    [Required]
    public string? Category { get; set; }
    [Required]
    [Range(1, double.MaxValue)]
    public decimal Amount { get; set; }
    [Required]
    public DateTime ExpenseDate { get; set; }
    public string? Notes { get; set; }
}
