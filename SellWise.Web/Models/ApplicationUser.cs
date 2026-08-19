using Microsoft.AspNetCore.Identity;

namespace SellWise.Web.Models;

public class ApplicationUser : IdentityUser
{
    public string? OwnerName { get; set; }

    public ICollection<StoreMember> StoreMembers { get; set; } = new List<StoreMember>();
}
