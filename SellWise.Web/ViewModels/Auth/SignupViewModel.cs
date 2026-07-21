using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Auth;

public class SignupViewModel
{
    [Required]
    [EmailAddress]
    public string? Email { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 8)]
    public string? Password { get; set; } = string.Empty;

    [DataType(DataType.Password)]
    [Display(Name = "Confirm password")]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string? ConfirmPassword { get; set; } = string.Empty;

    [Required]
    [Display(Name = "Store Name")]
    public string? StoreName { get; set; } = string.Empty;

}
