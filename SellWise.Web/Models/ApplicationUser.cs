using Microsoft.AspNetCore.Identity;

namespace SellWise.Web.Models;

public class ApplicationUser : IdentityUser
{
    public string PreferredLang { get; set; } = "en";
    public ICollection<StoreMember> StoreMembers { get; set; } = new List<StoreMember>();
}
