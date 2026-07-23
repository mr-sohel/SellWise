using System;
using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Customer;

public class CustomerEditViewModel
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Customer name is required.")]
    [StringLength(200)]
    [Display(Name = "Full Name")]
    public string Name { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number.")]
    [Display(Name = "Phone")]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email address.")]
    [Display(Name = "Email")]
    public string? Email { get; set; }

    [Display(Name = "Address")]
    public string? Address { get; set; }
}
