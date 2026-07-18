using System;
using System.Collections.Generic;

namespace SellWise.Web.Models;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StoreId { get; set; }
    public Store Store { get; set; } = null!;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string Source { get; set; } = "walk_in";
    
    public decimal Total { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal Discount { get; set; }
    
    public string? Notes { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
