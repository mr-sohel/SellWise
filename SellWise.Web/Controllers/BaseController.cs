using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

[Authorize]
[AutoValidateAntiforgeryToken]
public abstract class BaseController : Controller
{
    protected readonly AppDbContext Db;

    protected BaseController(AppDbContext db)
    {
        Db = db;
    }

    protected Guid GetCurrentStoreId()
    {
        var storeIdStr = HttpContext.Session.GetString("ActiveStoreId");
        if (string.IsNullOrEmpty(storeIdStr))
            return Guid.Empty;

        return Guid.TryParse(storeIdStr, out var storeId) ? storeId : Guid.Empty;
    }

    protected async Task<bool> UserBelongsToStore(Guid storeId)
    {
        var userId = System.Security.Claims.ClaimTypes.NameIdentifier;
        var userIdValue = User.FindFirst(userId)?.Value;
        if (userIdValue == null) return false;

        return await Db.StoreMembers.AnyAsync(m => m.StoreId == storeId && m.UserId == userIdValue);
    }

    protected async Task<string?> GetCurrentUserRoleAsync(Guid storeId)
    {
        var userId = System.Security.Claims.ClaimTypes.NameIdentifier;
        var userIdValue = User.FindFirst(userId)?.Value;
        if (userIdValue == null) return null;

        var member = await Db.StoreMembers
            .FirstOrDefaultAsync(m => m.StoreId == storeId && m.UserId == userIdValue);
        return member?.Role;
    }

    protected async Task<bool> IsEmployeeAsync(Guid storeId)
    {
        var role = await GetCurrentUserRoleAsync(storeId);
        return string.Equals(role, "employee", StringComparison.OrdinalIgnoreCase);
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var storeId = GetCurrentStoreId();
            if (storeId == Guid.Empty || !await UserBelongsToStore(storeId))
            {
                // Clear invalid session state if it exists
                HttpContext.Session.Remove("ActiveStoreId");
                context.Result = new RedirectToActionResult("Login", "Auth", null);
                return;
            }

            var role = await GetCurrentUserRoleAsync(storeId);
            ViewData["CurrentStoreRole"] = role ?? "employee";
        }

        await base.OnActionExecutionAsync(context, next);
    }
}
