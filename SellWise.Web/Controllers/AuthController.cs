using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Infrastructure;
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
        var redirect = await RedirectIfAuthenticatedAsync();
        return redirect ?? View();
    }

    [HttpPost, EnableRateLimiting(RateLimiting.AuthPolicy)]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        // lockoutOnFailure: 5 wrong passwords lock the account for 15 minutes (see Program.cs).
        var result = await _signInManager.PasswordSignInAsync(model.Email!, model.Password!, isPersistent: true, lockoutOnFailure: true);
        if (result.IsLockedOut)
        {
            ModelState.AddModelError(string.Empty, "Too many failed attempts. Try again in 15 minutes.");
            return View(model);
        }
        if (!result.Succeeded)
        {
            ModelState.AddModelError(string.Empty, "Invalid email or password.");
            return View(model);
        }

        var user = await _userManager.FindByEmailAsync(model.Email!);
        var member = user == null ? null : await FirstMembershipAsync(user.Id);
        if (member == null)
            return RedirectToAction("Index", "Dashboard");

        SetActiveStore(member.StoreId);
        return RedirectToHome(member.Role);
    }

    [HttpGet]
    public async Task<IActionResult> Signup()
    {
        var redirect = await RedirectIfAuthenticatedAsync();
        return redirect ?? View();
    }

    /// <summary>Creates a user and their first store in one transaction; the user becomes its owner.</summary>
    [HttpPost, EnableRateLimiting(RateLimiting.AuthPolicy)]
    public async Task<IActionResult> Signup(SignupViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = new ApplicationUser { UserName = model.Email, Email = model.Email, OwnerName = model.OwnerName };
            var result = await _userManager.CreateAsync(user, model.Password!);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);
                return View(model);
            }

            var store = new Store { Name = model.StoreName! };
            _db.Stores.Add(store);
            _db.StoreMembers.Add(new StoreMember { StoreId = store.Id, UserId = user.Id, Role = StoreRoles.Owner });
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            await _signInManager.SignInAsync(user, isPersistent: true);
            SetActiveStore(store.Id);
            return RedirectToAction("Index", "Dashboard");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Signup failed for {Email}", model.Email);
            ModelState.AddModelError(string.Empty, "An error occurred during signup.");
            return View(model);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        HttpContext.Session.Clear();
        return RedirectToAction(nameof(Login));
    }

    /// <summary>Only users who already own a store may create additional stores.</summary>
    [HttpPost, Authorize]
    public async Task<IActionResult> CreateStore(CreateStoreViewModel model, string returnUrl = "/")
    {
        var userId = _userManager.GetUserId(User)!;

        var ownsAStore = await _db.StoreMembers.AnyAsync(m => m.UserId == userId && m.Role == StoreRoles.Owner);
        if (!ownsAStore)
        {
            TempData["ErrorMessage"] = "Only store owners can create new stores.";
            return RedirectToAction("Index", "Order");
        }

        if (!ModelState.IsValid)
        {
            TempData["ErrorMessage"] = "Store name is required.";
            return RedirectToAction("Index", "Dashboard");
        }

        var store = new Store { Name = model.StoreName!.Trim() };
        _db.Stores.Add(store);
        _db.StoreMembers.Add(new StoreMember { StoreId = store.Id, UserId = userId, Role = StoreRoles.Owner });
        await _db.SaveChangesAsync();

        SetActiveStore(store.Id);
        return RedirectToAction("Index", "Dashboard");
    }

    [HttpPost, Authorize]
    public async Task<IActionResult> SwitchStore(Guid storeId, string returnUrl = "/")
    {
        var userId = _userManager.GetUserId(User)!;
        var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == userId && m.StoreId == storeId);
        if (member == null)
            return RedirectToAction("Index", "Dashboard");

        SetActiveStore(storeId);

        // Staff can't open owner pages, so send them to the POS instead of the page they were on.
        if (member.Role != StoreRoles.Owner || !Url.IsLocalUrl(returnUrl))
            return RedirectToHome(member.Role);

        return LocalRedirect(returnUrl);
    }

    private async Task<IActionResult?> RedirectIfAuthenticatedAsync()
    {
        if (User.Identity?.IsAuthenticated != true)
            return null;

        var userId = _userManager.GetUserId(User);
        var member = userId == null ? null : await FirstMembershipAsync(userId);
        if (member == null)
        {
            await _signInManager.SignOutAsync();
            return null;
        }

        SetActiveStore(member.StoreId);
        return RedirectToHome(member.Role);
    }

    private Task<StoreMember?> FirstMembershipAsync(string userId) =>
        _db.StoreMembers.Where(m => m.UserId == userId).OrderBy(m => m.CreatedAt).FirstOrDefaultAsync();

    private void SetActiveStore(Guid storeId) =>
        HttpContext.Session.SetString(BaseController.ActiveStoreSessionKey, storeId.ToString());

    private IActionResult RedirectToHome(string role) =>
        role == StoreRoles.Owner ? RedirectToAction("Index", "Dashboard") : RedirectToAction("Index", "Order");
}
