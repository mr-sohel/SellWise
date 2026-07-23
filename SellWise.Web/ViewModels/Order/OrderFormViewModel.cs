using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace SellWise.Web.ViewModels.Order;

public class OrderFormViewModel
{
    public Guid? CustomerId { get; set; }

    // Optional fields to create a new customer on the fly
    public string? NewCustomerName { get; set; }
    public string? NewCustomerPhone { get; set; }
    public string? NewCustomerAddress { get; set; }

    [Required]
    
    [Range(0, 100000)]
    public decimal DeliveryCharge { get; set; }
    
    [Range(0, 1000000)]
    public decimal Discount { get; set; }
    
    public string? Notes { get; set; }
    
    public List<OrderItemViewModel> Items { get; set; } = new List<OrderItemViewModel> { new OrderItemViewModel() };

    // JSON Strings for POS Vanilla JS State
    public string ProductsJson { get; set; } = "[]";
    public string CustomersJson { get; set; } = "[]";
}

public class OrderItemViewModel
{
    public Guid ProductId { get; set; }
    
    [Range(1, 10000)]
    public int Quantity { get; set; } = 1;
}
