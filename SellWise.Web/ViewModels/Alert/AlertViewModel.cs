using System;

namespace SellWise.Web.ViewModels.Alert;

public class AlertViewModel
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? Type { get; set; }
    public string? Message { get; set; }
    public string? Severity { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
