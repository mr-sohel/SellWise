using System;

namespace SellWise.Web.ViewModels.Order;

public class OrderViewModel
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public string? Status { get; set; }
}
