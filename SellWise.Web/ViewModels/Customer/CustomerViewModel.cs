using System;

namespace SellWise.Web.ViewModels.Customer;

public class CustomerViewModel
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }

    public DateTime? LastOrderDate { get; set; }
}
