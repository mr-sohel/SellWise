using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

/// <summary>
/// Base class for every store-scoped controller. Before each action it resolves the
/// user's active store and role, so actions can rely on <see cref="StoreId"/> and
/// <see cref="IsOwner"/> instead of re-querying memberships.
/// </summary>
[Authorize]
[AutoValidateAntiforgeryToken]
public abstract class BaseController : Controller
{
    public const string ActiveStoreSessionKey = "ActiveStoreId";

    protected readonly AppDbContext Db;

    protected BaseController(AppDbContext db)
    {
        Db = db;
    }

    /// <summary>The store the current user is working in. Every query must filter by it.</summary>
    protected Guid StoreId { get; private set; }

    protected string Role { get; private set; } = StoreRoles.Staff;

    protected bool IsOwner => Role == StoreRoles.Owner;

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var membership = userId == null ? null : await ResolveActiveMembershipAsync(userId);

        if (membership == null)
        {
            HttpContext.Session.Remove(ActiveStoreSessionKey);
            context.Result = RedirectToAction("Login", "Auth");
            return;
        }

        StoreId = membership.StoreId;
        Role = membership.Role;
        ViewData["CurrentStoreRole"] = Role;

        var ownerOnly = context.ActionDescriptor.EndpointMetadata.OfType<OwnerOnlyAttribute>().Any();
        if (ownerOnly && !IsOwner)
        {
            context.Result = IsAjaxRequest()
                ? StatusCode(StatusCodes.Status403Forbidden, new { success = false, message = "Only the store owner can do this." })
                : DenyAndRedirect();
            return;
        }

        await base.OnActionExecutionAsync(context, next);
    }

    /// <summary>
    /// Returns the membership for the store saved in session. The session can expire
    /// (20 min idle) while the login cookie is still valid, so in that case we fall back
    /// to the user's first store instead of bouncing them to the login page.
    /// </summary>
    private async Task<StoreMember?> ResolveActiveMembershipAsync(string userId)
    {
        if (Guid.TryParse(HttpContext.Session.GetString(ActiveStoreSessionKey), out var storeId))
        {
            var current = await Db.StoreMembers.AsNoTracking()
                .FirstOrDefaultAsync(m => m.StoreId == storeId && m.UserId == userId);
            if (current != null) return current;
        }

        var fallback = await Db.StoreMembers.AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.CreatedAt)
            .FirstOrDefaultAsync();

        if (fallback != null)
            HttpContext.Session.SetString(ActiveStoreSessionKey, fallback.StoreId.ToString());

        return fallback;
    }

    private bool IsAjaxRequest() =>
        Request.Headers.XRequestedWith == "XMLHttpRequest";

    private IActionResult DenyAndRedirect()
    {
        TempData["ErrorMessage"] = "Only the store owner can access that page.";
        return RedirectToAction("Index", "Order");
    }
}
