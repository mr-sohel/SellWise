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

        var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, true, true);

        if (result.Succeeded)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null)
            {
                var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
                if (member != null)
                {
                    HttpContext.Session.SetString("ActiveStoreId", member.StoreId.ToString());
                }
            }
            return RedirectToAction("Index", "Dashboard");
        }

        if (result.IsLockedOut)
        {
            ModelState.AddModelError(string.Empty, "Account locked. Try again in 15 minutes.");
            return View(model);
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
                Email = model.Email
            };
            
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var store = new Store { Name = model.StoreName };
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

    private async Task<IActionResult?> RedirectIfAuthenticated()
    {
        if (User.Identity?.IsAuthenticated != true) return null;

        var storeIdStr = HttpContext.Session.GetString("ActiveStoreId");
        if (!string.IsNullOrEmpty(storeIdStr))
            return RedirectToAction("Index", "Dashboard");

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            await _signInManager.SignOutAsync();
            return View();
        }

        var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
        if (member == null)
        {
            await _signInManager.SignOutAsync();
            return View();
        }

        HttpContext.Session.SetString("ActiveStoreId", member.StoreId.ToString());
        return RedirectToAction("Index", "Dashboard");
    }
}
