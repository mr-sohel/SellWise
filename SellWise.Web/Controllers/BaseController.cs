using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Linq;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Controllers;

[Authorize]
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
}
