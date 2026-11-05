namespace SellWise.Web.Models;

/// <summary>
/// Order statuses and the transitions allowed between them (a small state machine).
/// </summary>
public static class OrderStatus
{
    public const string Pending = "pending";
    public const string Processing = "processing";
    public const string Delivered = "delivered";
    public const string Completed = "completed";
    public const string Cancelled = "cancelled";
    public const string Returned = "returned";

    private static readonly Dictionary<string, string[]> Transitions = new()
    {
        [Pending] = new[] { Processing, Delivered, Completed, Cancelled },
        [Processing] = new[] { Delivered, Completed, Cancelled },
        [Delivered] = new[] { Completed, Returned },
        [Completed] = new[] { Returned },
        [Cancelled] = new[] { Pending },   // re-open a cancelled order (takes the stock again)
        [Returned] = Array.Empty<string>()
    };

    public static IReadOnlyList<string> NextStatuses(string current) =>
        Transitions.TryGetValue(current, out var next) ? next : Array.Empty<string>();

    public static bool CanChange(string from, string to) => NextStatuses(from).Contains(to);

    /// <summary>Cancelled and returned orders don't count towards revenue, stock or customer totals.</summary>
    public static bool CountsAsSale(string status) => status != Cancelled && status != Returned;
}
