using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;

namespace SellWise.Web.Controllers;

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
            
        return Guid.Parse(storeIdStr);
    }

    protected async Task<bool> UserBelongsToStore(Guid storeId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return false;
        
        return await Db.StoreMembers.AnyAsync(m => m.StoreId == storeId && m.UserId == userId);
    }
}
