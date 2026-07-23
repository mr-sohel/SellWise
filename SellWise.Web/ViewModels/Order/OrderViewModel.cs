using System;
using System.Collections.Generic;

namespace SellWise.Web.ViewModels.Order;

public class OrderViewModel
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public string? Status { get; set; }
}

public class OrderDetailsViewModel
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? Status { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal Total { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal Discount { get; set; }
    public string? Notes { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public List<OrderDetailItemViewModel> Items { get; set; } = new();
}

public class OrderDetailItemViewModel
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
