namespace SellWise.Web.Authorization;

/// <summary>Role a user holds inside a single store (stored on <c>StoreMember.Role</c>).</summary>
public static class StoreRoles
{
    /// <summary>Full access: dashboard, reports, inventory, staff management.</summary>
    public const string Owner = "owner";

    /// <summary>Front-of-house access: POS, orders, customers, product lookup.</summary>
    public const string Staff = "staff";
}
