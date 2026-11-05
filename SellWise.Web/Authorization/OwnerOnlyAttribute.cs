namespace SellWise.Web.Authorization;

/// <summary>
/// Marks a controller or action as available only to the owner of the active store.
/// Enforced by <see cref="Controllers.BaseController"/>, which already knows the
/// current user's role for the active store.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class OwnerOnlyAttribute : Attribute
{
}
