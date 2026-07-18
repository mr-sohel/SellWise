using System;

namespace SellWise.Web.ViewModels.Settings;

public class EmployeeViewModel
{
    public string? UserId { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? FullName { get; set; } = string.Empty;
    public string? Role { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}
