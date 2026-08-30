using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Settings;

public class ProfileViewModel
{
    public string? Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Store Name is required.")]
    public string? StoreName { get; set; } = string.Empty;

    [Display(Name = "User Name")]
    [Required(ErrorMessage = "User Name is required.")]
    public string? OwnerName { get; set; } = string.Empty;

    public string? Role { get; set; } = string.Empty;

}
