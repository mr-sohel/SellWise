using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Customer;

public class CustomerCreateViewModel
{
    [Required(ErrorMessage = "Customer name is required.")]
    [StringLength(200)]
    [Display(Name = "Full Name")]
    public string Name { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number.")]
    [Display(Name = "Phone Number")]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email address.")]
    [Display(Name = "Email Address")]
    public string? Email { get; set; }

    [Display(Name = "Address")]
    public string? Address { get; set; }
}
