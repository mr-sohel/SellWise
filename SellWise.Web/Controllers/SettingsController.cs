using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Collections.Generic;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Settings;

namespace SellWise.Web.Controllers;

[Authorize]
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
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return RedirectToAction("Login", "Auth");

        var member = await Db.StoreMembers
            .Include(sm => sm.Store)
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == user.Id);

        var vm = new ProfileViewModel
        {
            Email = user.Email ?? "",
            StoreName = member?.Store?.Name ?? "",
            OwnerName = user.OwnerName ?? "",
            Role = member?.Role ?? ""
        };

        return View("Index", vm);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateProfile(ProfileViewModel model)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return RedirectToAction("Login", "Auth");

        var member = await Db.StoreMembers
            .Include(sm => sm.Store)
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == user.Id);
        if (member?.Store != null)
        {
            member.Store.Name = model.StoreName!;
        }

        user.OwnerName = model.OwnerName;
        await _userManager.UpdateAsync(user);
        await Db.SaveChangesAsync();

        TempData["Success"] = "Profile updated successfully.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> ChangePassword(ChangePasswordViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return await Index();
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return RedirectToAction("Login", "Auth");

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword!, model.NewPassword!);

        if (result.Succeeded)
        {
            await _signInManager.RefreshSignInAsync(user);
            TempData["Success"] = "Password changed successfully.";
        }
        else
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return await Index();
        }

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Staff()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null) return RedirectToAction("Login", "Auth");

        var currentMember = await Db.StoreMembers
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == currentUser.Id);
        if (currentMember?.Role != "owner")
        {
            TempData["Error"] = "Only the store owner can manage staff.";
            return RedirectToAction(nameof(Index));
        }

        var members = await Db.StoreMembers
            .Include(sm => sm.User)
            .Where(sm => sm.StoreId == storeId)
            .ToListAsync();

        var employees = members.Select(m => new EmployeeViewModel
        {
            UserId = m.UserId,
            Email = m.User?.Email ?? "",
            FullName = m.User?.UserName ?? "",
            Role = m.Role,
            JoinedAt = m.CreatedAt
        }).ToList();

        return View("Staff", employees);
    }

    [HttpPost]
    public async Task<IActionResult> InviteEmployee(InviteEmployeeViewModel model)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null) return RedirectToAction("Login", "Auth");

        var currentMember = await Db.StoreMembers
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == currentUser.Id);
        if (currentMember?.Role != "owner")
        {
            TempData["Error"] = "Only the store owner can invite employees.";
            return RedirectToAction(nameof(Index));
        }

        if (!ModelState.IsValid)
            return RedirectToAction(nameof(Staff));

        if (model.Role != "employee" && model.Role != "manager")
        {
            TempData["Error"] = "Invalid role. Must be 'employee' or 'manager'.";
            return RedirectToAction(nameof(Staff));
        }

        var existingUser = await _userManager.FindByEmailAsync(model.Email!);
        if (existingUser != null)
        {
            var alreadyMember = await Db.StoreMembers
                .AnyAsync(sm => sm.StoreId == storeId && sm.UserId == existingUser.Id);
            if (alreadyMember)
            {
                TempData["Error"] = "This user is already a member of your store.";
                return RedirectToAction(nameof(Staff));
            }

            var storeMember = new StoreMember
            {
                StoreId = storeId,
                UserId = existingUser.Id,
                Role = model.Role
            };
            Db.StoreMembers.Add(storeMember);
            await Db.SaveChangesAsync();

            TempData["Success"] = $"{model.Email} has been added to your store as {model.Role}.";
            return RedirectToAction(nameof(Staff));
        }

        var newUser = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            OwnerName = model.FullName
        };

        using var transaction = await Db.Database.BeginTransactionAsync();
        try
        {
            var result = await _userManager.CreateAsync(newUser, model.Password!);
            if (result.Succeeded)
            {
                var storeMember = new StoreMember
                {
                    StoreId = storeId,
                    UserId = newUser.Id,
                    Role = model.Role
                };
                Db.StoreMembers.Add(storeMember);
                await Db.SaveChangesAsync();
                await transaction.CommitAsync();

                TempData["Success"] = $"{model.FullName} has been invited as {model.Role}.";
            }
            else
            {
                await transaction.RollbackAsync();
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                TempData["Error"] = string.Join(" ", result.Errors.Select(e => e.Description));
            }
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            ModelState.AddModelError(string.Empty, "Failed to assign user to the store.");
            TempData["Error"] = "Failed to assign user to the store. Please try again.";
        }

        return RedirectToAction(nameof(Staff));
    }

    [HttpPost]
    public async Task<IActionResult> DeleteStore()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var userId = _userManager.GetUserId(User);
        if (userId == null) return RedirectToAction("Login", "Auth");

        var member = await Db.StoreMembers
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == userId);
        if (member?.Role != "owner")
        {
            TempData["Error"] = "Only the store owner can remove a store.";
            return RedirectToAction(nameof(Index));
        }

        using var transaction = await Db.Database.BeginTransactionAsync();
        try
        {
            var storeIdParam = new SqlParameter("storeId", storeId);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Forecasts WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Alerts WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM OrderItems WHERE OrderId IN (SELECT Id FROM Orders WHERE StoreId = @storeId)", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Orders WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Products WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Customers WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Expenses WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM StoreMembers WHERE StoreId = @storeId", storeIdParam);
            await Db.Database.ExecuteSqlRawAsync("DELETE FROM Stores WHERE Id = @storeId", storeIdParam);

            await transaction.CommitAsync();

            var nextStore = await Db.StoreMembers
                .Where(m => m.UserId == userId && m.StoreId != storeId)
                .Select(m => m.StoreId)
                .FirstOrDefaultAsync();

            if (nextStore != Guid.Empty)
            {
                HttpContext.Session.SetString("ActiveStoreId", nextStore.ToString());
            }
            else
            {
                HttpContext.Session.Remove("ActiveStoreId");
            }

            TempData["Success"] = "Store removed successfully.";
            return RedirectToAction("Index", "Dashboard");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "An error occurred while deleting the store.");
            TempData["Error"] = "An error occurred while deleting the store. Please try again.";
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> RemoveEmployee(string userId)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null) return RedirectToAction("Login", "Auth");

        var currentMember = await Db.StoreMembers
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == currentUser.Id);
        if (currentMember?.Role != "owner")
        {
            TempData["Error"] = "Only the store owner can remove employees.";
            return RedirectToAction(nameof(Index));
        }

        if (userId == currentUser.Id)
        {
            TempData["Error"] = "You cannot remove yourself from the store.";
            return RedirectToAction(nameof(Staff));
        }

        var member = await Db.StoreMembers
            .FirstOrDefaultAsync(sm => sm.StoreId == storeId && sm.UserId == userId);
        if (member != null)
        {
            Db.StoreMembers.Remove(member);
            await Db.SaveChangesAsync();
            TempData["Success"] = "Employee removed from the store.";
        }

        return RedirectToAction(nameof(Staff));
    }
}
