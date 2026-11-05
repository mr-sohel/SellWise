using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Settings;

namespace SellWise.Web.Controllers;

public class SettingsController : BaseController
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ILogger<SettingsController> logger) : base(db)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    public async Task<IActionResult> Index()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return RedirectToAction("Login", "Auth");

        var storeName = await Db.Stores
            .Where(s => s.Id == StoreId)
            .Select(s => s.Name)
            .FirstAsync();

        return View("Index", new ProfileViewModel
        {
            Email = user.Email ?? "",
            StoreName = storeName,
            OwnerName = user.OwnerName ?? "",
            Role = Role
        });
    }

    [HttpPost]
    public async Task<IActionResult> UpdateProfile(ProfileViewModel model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return RedirectToAction("Login", "Auth");

        if (IsOwner && !string.IsNullOrWhiteSpace(model.StoreName))
        {
            var store = await Db.Stores.FirstAsync(s => s.Id == StoreId);
            store.Name = model.StoreName.Trim();
            await Db.SaveChangesAsync();
        }

        user.OwnerName = model.OwnerName;
        await _userManager.UpdateAsync(user);

        TempData["Success"] = "Profile updated successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
    {
        if (!ModelState.IsValid)
            return await Index();

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return RedirectToAction("Login", "Auth");

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword!, model.NewPassword!);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
                ModelState.AddModelError(string.Empty, error.Description);
            return await Index();
        }

        await _signInManager.RefreshSignInAsync(user);
        TempData["Success"] = "Password changed successfully.";
        return RedirectToAction(nameof(Index));
    }

    [OwnerOnly]
    public async Task<IActionResult> Staff()
    {
        var members = await Db.StoreMembers
            .Where(m => m.StoreId == StoreId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new StaffMemberViewModel
            {
                UserId = m.UserId,
                Email = m.User.Email ?? "",
                FullName = m.User.OwnerName ?? m.User.UserName ?? "",
                Role = m.Role,
                JoinedAt = m.CreatedAt
            })
            .ToListAsync();

        return View("Staff", members);
    }

    /// <summary>
    /// Adds a staff member to the active store. If the email already has an account it is
    /// linked to this store; otherwise a new account is created with the given password.
    /// </summary>
    [HttpPost, OwnerOnly]
    public async Task<IActionResult> AddStaff(AddStaffViewModel model)
    {
        if (!ModelState.IsValid)
        {
            TempData["Error"] = "Please fill in all required fields.";
            return RedirectToAction(nameof(Staff));
        }

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await Db.StoreMembers.AnyAsync(m => m.StoreId == StoreId && m.UserId == user.Id))
        {
            TempData["Error"] = "This user is already a member of your store.";
            return RedirectToAction(nameof(Staff));
        }

        if (user == null && string.IsNullOrEmpty(model.Password))
        {
            TempData["Error"] = "A password is required to create a new account.";
            return RedirectToAction(nameof(Staff));
        }

        // UserManager shares this DbContext, so one transaction covers the new user and the membership.
        await using var transaction = await Db.Database.BeginTransactionAsync();
        try
        {
            if (user == null)
            {
                user = new ApplicationUser { UserName = model.Email, Email = model.Email, OwnerName = model.FullName };
                var result = await _userManager.CreateAsync(user, model.Password!);
                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();
                    TempData["Error"] = string.Join(" ", result.Errors.Select(e => e.Description));
                    return RedirectToAction(nameof(Staff));
                }
            }

            Db.StoreMembers.Add(new StoreMember { StoreId = StoreId, UserId = user.Id, Role = StoreRoles.Staff });
            await Db.SaveChangesAsync();
            await transaction.CommitAsync();

            TempData["Success"] = $"{model.FullName} was added as staff.";
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to add {Email} to store {StoreId}", model.Email, StoreId);
            TempData["Error"] = "Could not add the staff member. Please try again.";
        }

        return RedirectToAction(nameof(Staff));
    }

    [HttpPost, OwnerOnly]
    public async Task<IActionResult> RemoveStaff(string userId)
    {
        var removed = await Db.StoreMembers
            .Where(m => m.StoreId == StoreId && m.UserId == userId && m.Role != StoreRoles.Owner)
            .ExecuteDeleteAsync();

        TempData[removed > 0 ? "Success" : "Error"] = removed > 0
            ? "Staff member removed from the store."
            : "That member could not be removed.";

        return RedirectToAction(nameof(Staff));
    }
}
