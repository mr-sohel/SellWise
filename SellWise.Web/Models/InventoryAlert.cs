using System;

namespace SellWise.Web.Models;

public class InventoryAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StoreId { get; set; }
    public Store Store { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
