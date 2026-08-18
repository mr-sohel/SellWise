using System.ComponentModel.DataAnnotations;

namespace SellWise.Web.ViewModels.Auth;

public class CreateStoreViewModel
{
    [Required]
    [StringLength(100, ErrorMessage = "Store name must be at most 100 characters.")]
    [Display(Name = "Store Name")]
    public string? StoreName { get; set; } = string.Empty;
}