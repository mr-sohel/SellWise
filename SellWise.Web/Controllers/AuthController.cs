using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Auth;

namespace SellWise.Web.Controllers;

[AutoValidateAntiforgeryToken]
public class AuthController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _db;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext db,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Login()
    {
        var redirect = await RedirectIfAuthenticated();
        if (redirect != null) return redirect;
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        var result = await _signInManager.PasswordSignInAsync(model.Email!, model.Password!, true, false);

        if (result.Succeeded)
        {
            var user = await _userManager.FindByEmailAsync(model.Email!);
            if (user != null)
            {
                var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
                if (member != null)
                {
                    HttpContext.Session.SetString("ActiveStoreId", member.StoreId.ToString());
                    if (string.Equals(member.Role, "employee", StringComparison.OrdinalIgnoreCase))
                    {
                        return RedirectToAction("Index", "Order");
                    }
                }
            }
            return RedirectToAction("Index", "Dashboard");
        }

        ModelState.AddModelError(string.Empty, "Invalid email or password.");
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Signup()
    {
        var redirect = await RedirectIfAuthenticated();
        if (redirect != null) return redirect;
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Signup(SignupViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = new ApplicationUser 
            { 
                UserName = model.Email, 
                Email = model.Email,
                OwnerName = model.OwnerName
            };
            
            var result = await _userManager.CreateAsync(user, model.Password!);

            if (result.Succeeded)
            {
                var store = new Store { Name = model.StoreName! };
                _db.Stores.Add(store);
                
                var storeMember = new StoreMember
                {
                    StoreId = store.Id,
                    UserId = user.Id,
                    Role = "owner"
                };
                _db.StoreMembers.Add(storeMember);
                
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                await _signInManager.SignInAsync(user, isPersistent: true);
                HttpContext.Session.SetString("ActiveStoreId", store.Id.ToString());
                
                return RedirectToAction("Index", "Dashboard");
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "An error occurred during signup.");
            ModelState.AddModelError(string.Empty, "An error occurred during signup.");
        }

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        HttpContext.Session.Clear();
        return RedirectToAction(nameof(Login));
    }

    [HttpPost]
    public async Task<IActionResult> CreateStore(CreateStoreViewModel model, string returnUrl = "/")
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return RedirectToAction(nameof(Login));

        // Enforce store creation permission: Only owners can create stores
        var activeStoreId = HttpContext.Session.GetString("ActiveStoreId");
        bool isOwner = false;

        if (!string.IsNullOrEmpty(activeStoreId) && Guid.TryParse(activeStoreId, out var currentStoreGuid))
        {
            var currentMember = await _db.StoreMembers
                .FirstOrDefaultAsync(m => m.StoreId == currentStoreGuid && m.UserId == userId);
            isOwner = currentMember?.Role == "owner";
        }
        else
        {
            isOwner = await _db.StoreMembers.AnyAsync(m => m.UserId == userId && m.Role == "owner");
        }

        var hasMemberships = await _db.StoreMembers.AnyAsync(m => m.UserId == userId);
        if (hasMemberships && !isOwner)
        {
            TempData["Error"] = "Only store owners are allowed to create new stores.";
            return RedirectToAction("Index", "Dashboard");
        }

        if (!ModelState.IsValid)
        {
            TempData["Error"] = "Store name is required.";
            return RedirectToAction("Index", "Dashboard");
        }

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var store = new Store { Name = model.StoreName! };
            _db.Stores.Add(store);

            var storeMember = new StoreMember
            {
                StoreId = store.Id,
                UserId = userId,
                Role = "owner"
            };
            _db.StoreMembers.Add(storeMember);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            HttpContext.Session.SetString("ActiveStoreId", store.Id.ToString());
            TempData["Success"] = $"Store \"{store.Name}\" created successfully.";
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "An error occurred while creating a store.");
            TempData["Error"] = "An error occurred while creating the store. Please try again.";
        }

        if (Url.IsLocalUrl(returnUrl))
        {
            return LocalRedirect(returnUrl);
        }

        return RedirectToAction("Index", "Dashboard");
    }

    [HttpPost]
    public async Task<IActionResult> SwitchStore(Guid storeId, string returnUrl = "/")
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return RedirectToAction(nameof(Login));

        var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == userId && m.StoreId == storeId);
        if (member != null)
        {
            HttpContext.Session.SetString("ActiveStoreId", storeId.ToString());
            if (string.Equals(member.Role, "employee", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(returnUrl) || returnUrl == "/" ||
                    returnUrl.StartsWith("/Dashboard", StringComparison.OrdinalIgnoreCase) ||
                    returnUrl.StartsWith("/Expense", StringComparison.OrdinalIgnoreCase) ||
                    returnUrl.StartsWith("/Report", StringComparison.OrdinalIgnoreCase))
                {
                    return RedirectToAction("Index", "Order");
                }
            }
        }

        if (Url.IsLocalUrl(returnUrl))
        {
            return LocalRedirect(returnUrl);
        }

        return RedirectToAction("Index", "Dashboard");
    }

    private async Task<IActionResult?> RedirectIfAuthenticated()
    {
        if (User.Identity?.IsAuthenticated != true) return null;

        var userId = _userManager.GetUserId(User);
        if (userId == null)
        {
            await _signInManager.SignOutAsync();
            return null;
        }

        var storeIdStr = HttpContext.Session.GetString("ActiveStoreId");
        StoreMember? member = null;
        if (!string.IsNullOrEmpty(storeIdStr) && Guid.TryParse(storeIdStr, out var currentStoreGuid))
        {
            member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.StoreId == currentStoreGuid && m.UserId == userId);
        }

        if (member == null)
        {
            member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == userId);
            if (member == null)
            {
                await _signInManager.SignOutAsync();
                return null;
            }
            HttpContext.Session.SetString("ActiveStoreId", member.StoreId.ToString());
        }

        if (string.Equals(member.Role, "employee", StringComparison.OrdinalIgnoreCase))
        {
            return RedirectToAction("Index", "Order");
        }

        return RedirectToAction("Index", "Dashboard");
    }
}
