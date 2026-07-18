using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace SellWise.Web.ViewModels.Order;

public class OrderFormViewModel
{
    public Guid? CustomerId { get; set; }
    
    [Required]
    public string Source { get; set; } = "walk_in";
    
    [Range(0, 100000)]
    public decimal DeliveryCharge { get; set; }
    
    [Range(0, 1000000)]
    public decimal Discount { get; set; }
    
    public string? Notes { get; set; }
    
    public List<OrderItemViewModel> Items { get; set; } = new List<OrderItemViewModel> { new OrderItemViewModel() };
    
    public IEnumerable<SelectListItem> AvailableProducts { get; set; } = new List<SelectListItem>();
    public IEnumerable<SelectListItem> AvailableCustomers { get; set; } = new List<SelectListItem>();
}

public class OrderItemViewModel
{
    public Guid ProductId { get; set; }
    
    [Range(1, 10000)]
    public int Quantity { get; set; } = 1;
}
