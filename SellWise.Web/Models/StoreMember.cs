using System;

namespace SellWise.Web.Models;

public class StoreMember
{
    public Guid StoreId { get; set; }
    public Store Store { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public string Role { get; set; } = "manager";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
