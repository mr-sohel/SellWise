# Built-in Classes & Methods in SellWise

> **Purpose:** This document is a study guide for every built-in .NET / ASP.NET Core class and method used in the SellWise project. Each entry explains what it is, why it exists, and exactly how/where we use it (with `file:line` references for quick navigation).

---

## Table of Contents

1. [ASP.NET Core Identity](#1-aspnet-core-identity)
2. [ASP.NET Core MVC](#2-aspnet-core-mvc)
3. [ASP.NET Core Hosting & Builder](#3-aspnet-core-hosting--builder)
4. [Entity Framework Core](#4-entity-framework-core)
5. [HTTP & Networking](#5-http--networking)
6. [Session, Cache & Logging](#6-session-cache--logging)
7. [System.* Utilities](#7-system-utilities)
8. [Third-Party Libraries](#8-third-party-libraries)
9. [Cheat Sheet — Quick Lookup](#9-cheat-sheet--quick-lookup)

---

## 1. ASP.NET Core Identity

ASP.NET Core Identity is the built-in membership system that handles user registration, password hashing, sign-in, roles, claims, and cookie-based authentication.

### 1.1 `UserManager<TUser>`

**What it is:** The high-level API for managing users in the identity store (create, update, delete, find, password operations, role assignment, claims, etc.).

**Namespace:** `Microsoft.AspNetCore.Identity`

**Why we use it:** Avoids writing our own user table, password hashing, and lookup logic. We just call methods.

**Used in our project:**

| Method | Where | Why |
|--------|-------|-----|
| `GetUserAsync(ClaimsPrincipal)` | `Controllers/SettingsController.cs:39,63,90,117,151,306` | Resolves the currently signed-in `ApplicationUser` from the cookie's `ClaimsPrincipal` (`User`). |
| `GetUserId(ClaimsPrincipal)` | `Controllers/AuthController.cs:138,185,210` | Reads the user's `Id` (PK) directly from claims — cheaper than a DB hit. |
| `FindByEmailAsync(string)` | `Controllers/AuthController.cs:48,171`; `Program.cs:51` | Looks up a user row by email. |
| `CreateAsync(user, password)` | `Controllers/AuthController.cs:88`; `Controllers/SettingsController.cs:205`; `Program.cs:55` | Creates a user + hashes password atomically. Returns `IdentityResult` with `.Succeeded` and `.Errors`. |
| `UpdateAsync(user)` | `Controllers/SettingsController.cs:75` | Persists edits to the user row (e.g., `OwnerName`). |
| `ChangePasswordAsync(user, oldPw, newPw)` | `Controllers/SettingsController.cs:93` | Verifies the current password and replaces the hash. |

**Example:**
```csharp
var result = await _userManager.CreateAsync(user, model.Password!);
if (result.Succeeded) { /* signed in */ }
foreach (var error in result.Errors) { /* display */ }
```

---

### 1.2 `SignInManager<TUser>`

**What it is:** Handles cookie-based sign-in/sign-out and external login flows. Wraps `UserManager` with auth concerns.

**Namespace:** `Microsoft.AspNetCore.Identity`

**Why we use it:** One-line sign-in that creates the auth cookie, plus sign-out that clears it.

**Used in our project:**

| Method | Where | Why |
|--------|-------|-----|
| `PasswordSignInAsync(email, pw, isPersistent, lockoutOnFailure)` | `Controllers/AuthController.cs:44` | Validates credentials and issues the auth cookie on success. |
| `SignInAsync(user, isPersistent)` | `Controllers/AuthController.cs:106` | Issues cookie for newly-created users (signup flow). |
| `SignOutAsync()` | `Controllers/AuthController.cs:130,213,220` | Clears the auth cookie. |
| `RefreshSignInAsync(user)` | `Controllers/SettingsController.cs:97` | Re-issues cookie so the password change isn't invalidated by the old cookie's security stamp. |

**Example:**
```csharp
var result = await _signInManager.PasswordSignInAsync(model.Email!, model.Password!, true, false);
if (result.Succeeded) { /* redirect */ }
```

---

### 1.3 `IdentityDbContext<TUser>`

**What it is:** Pre-built `DbContext` that adds the Identity schema tables (users, roles, claims, logins, role-claims, user-roles, user-tokens).

**Namespace:** `Microsoft.AspNetCore.Identity.EntityFrameworkCore`

**Why we use it:** We get all the Identity tables for free; we only add our own `DbSet<>` properties.

**Used in our project:**
- `Data/AppDbContext.cs:7` — `public class AppDbContext : IdentityDbContext<ApplicationUser>`.
- Inherits all `Users`, `Roles`, `UserRoles`, `UserClaims`, `UserLogins`, `UserTokens`, `RoleClaims` tables.

---

### 1.4 `IdentityRole`

**What it is:** The default role entity (just an `Id` + `Name`).

**Namespace:** `Microsoft.AspNetCore.Identity`

**Why we use it:** Type parameter for `AddIdentity<TUser, TRole>` so the framework knows which role type to use.

**Used in our project:**
- `Program.cs:12` — `builder.Services.AddIdentity<ApplicationUser, IdentityRole>()`.

> **Note:** We currently store roles as plain strings (`"owner"`, `"manager"`, `"employee"`) in our own `StoreMembers.Role` column rather than using `IdentityRole` directly. We kept the default `IdentityRole` registration for future role-based features.

---

### 1.5 `IdentityUser`

**What it is:** Default user entity with built-in properties: `Id`, `UserName`, `Email`, `EmailConfirmed`, `PasswordHash`, `PhoneNumber`, security stamp, etc.

**Namespace:** `Microsoft.AspNetCore.Identity`

**Why we use it:** We inherit from it to add a custom `OwnerName` property without writing the base user table ourselves.

**Used in our project:**
- `Models/ApplicationUser.cs:5` — `public class ApplicationUser : IdentityUser`.

---

### 1.6 `ApplicationUser` (our custom class)

**What it is:** Our project-specific user class extending `IdentityUser`.

**Why we extended it:** We needed an `OwnerName` for display (the person who owns the store).

**Fields added:**
```csharp
public string? OwnerName { get; set; }
public ICollection<StoreMember> StoreMembers { get; set; } = new List<StoreMember>();
```

---

### 1.7 `ClaimsPrincipal` & `User` Property

**What it is:** Represents the current user's identity as a collection of claims. Exposed in MVC via `Controller.User`.

**Why we use it:** The `[Authorize]` attribute populates it from the auth cookie, and we read claims/identity for auth checks.

**Used in our project:**
- `Controllers/BaseController.cs:36` — `User.FindFirst(userId)?.Value` to read the NameIdentifier claim.
- `Controllers/AuthController.cs:138,185,204,210` — `User.Identity?.IsAuthenticated`, `_userManager.GetUserId(User)`.

---

## 2. ASP.NET Core MVC

The Model-View-Controller framework: routing, controllers, action results, filters, model binding, validation.

### 2.1 `Controller` (Base Class)

**What it is:** Base class for all MVC controllers. Provides `View()`, `RedirectToAction()`, `Json()`, `HttpContext`, `User`, `ModelState`, `ViewData`, `ViewBag`, `TempData`, etc.

**Why we use it:** We inherit from it in every controller (`BaseController` → all others; `AuthController` directly).

**Used in our project:** Every file under `Controllers/`.

---

### 2.2 `BaseController` (Our Custom Abstract Class)

**What it is:** Our multi-tenant-aware base. Adds `[Authorize]`, `[AutoValidateAntiforgeryToken]`, and an `OnActionExecutionAsync` filter that validates store membership.

**Why we wrote it:** DRY — every action needs store-tenant enforcement, so we put it once.

**Key members:**
- `GetCurrentStoreId()` — `Controllers/BaseController.cs:24` reads `ActiveStoreId` from session.
- `UserBelongsToStore(Guid)` — `Controllers/BaseController.cs:33` checks `StoreMembers` table.
- `OnActionExecutionAsync(...)` — `Controllers/BaseController.cs:42` runs before every action; redirects to login if user lost store membership.

---

### 2.3 `IActionResult` and Action Result Types

**What it is:** The return type interface for controller actions. Concrete types represent different responses.

| Result Type | Where | Purpose |
|-------------|-------|---------|
| `ViewResult` (`View()`) | All controllers | Render a Razor view. |
| `PartialViewResult` (`PartialView()`) | `Controllers/DashboardController.cs:65` | Render a Razor partial (used for AJAX-loaded forecast grid). |
| `RedirectToActionResult` (`RedirectToAction()`) | All controllers | 302 to another action. |
| `JsonResult` (`Json()`) | `Controllers/SearchController.cs:23,26,66` | Returns JSON for AJAX. |

**Example:**
```csharp
return Json(new { success = false, message = "No active store" });
return RedirectToAction("Index", "Dashboard");
return View(vm);
```

---

### 2.4 Action Filters & Attributes

**What they are:** Decorators on controllers/actions that inject cross-cutting behavior.

| Attribute | Where | Purpose |
|-----------|-------|---------|
| `[Authorize]` | All controllers except `AuthController` | Requires authenticated user. |
| `[AutoValidateAntiforgeryToken]` | `BaseController`, `AuthController` | Validates CSRF token on all unsafe verbs automatically. |
| `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]` | Many actions | Restricts HTTP verb. |
| `[ValidateAntiForgeryToken]` | `OrderController.cs:157,168,206,239`; `ProductController.cs:74,115,140,152`; `CustomerController.cs:106,140`; `ExpenseController.cs:64`; `AlertController.cs:54,65,81` | Explicit CSRF check (combined with `[HttpPost]`). |
| `[RequestSizeLimit(5 * 1024 * 1024)]` | `OrderController.cs:240`; `ProductController.cs:153` | Caps upload body at 5 MB for CSV imports. |
| `[NonAction]` | Not used | Marks a public method as not an action. |

---

### 2.5 `ActionExecutingContext` & `ActionExecutionDelegate`

**What they are:** Parameters for overriding `OnActionExecutionAsync` to implement custom filters.

**Why we use them:** Our multi-tenancy redirect logic in `BaseController.cs:42-57`.

**Example:**
```csharp
public override async Task OnActionExecutionAsync(
    ActionExecutingContext context,
    ActionExecutionDelegate next)
{
    if (User.Identity?.IsAuthenticated == true)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty || !await UserBelongsToStore(storeId))
        {
            context.Result = new RedirectToActionResult("Login", "Auth", null);
            return;
        }
    }
    await base.OnActionExecutionAsync(context, next);
}
```

---

### 2.6 `IFormFile`

**What it is:** Represents an uploaded file in MVC.

**Namespace:** `Microsoft.AspNetCore.Http`

**Why we use it:** CSV bulk-import for orders and products.

**Used in our project:**
- `Controllers/OrderController.cs:241` — `BulkImport(IFormFile file)`.
- `Controllers/ProductController.cs:154` — `BulkImport(IFormFile file)`.
- `Services/ProductService.cs:73` — `BulkImportAsync(... IFormFile file)`.

**Key members used:** `file.Length`, `file.OpenReadStream()`.

---

### 2.7 `UrlHelper` (`Url.IsLocalUrl`, `Url.LocalRedirect`)

**What it is:** Helpers for building and validating URLs in MVC.

**Why we use them:** Open-redirect protection — we only follow return URLs that point to our own host.

**Used in our project:**
- `Controllers/AuthController.cs:174,194` — `if (Url.IsLocalUrl(returnUrl)) return LocalRedirect(returnUrl);`

---

### 2.8 `ModelState` & `ModelStateDictionary`

**What it is:** Holds validation state for a model after binding and validation.

**Why we use it:** Standard way to surface validation errors to Razor views.

**Used in our project:**
- `AuthController.cs:41,75,114,121` — `ModelState.IsValid`, `ModelState.AddModelError(...)`.
- `OrderController.cs:192,196,203` — same.
- `ProductController.cs:77,121` — same.
- `CustomerController.cs:145` — same.
- `ExpenseController.cs:68` — same.
- `SettingsController.cs:85,104` — same.

---

### 2.9 `ViewData`, `ViewBag`, `TempData`

**What they are:** Dictionaries for passing data from controller to view.

| Member | Lifetime | Where used |
|--------|----------|------------|
| `ViewData["..."]` | Current request | Pagination (`CurrentPage`, `TotalPages`, `Search`, etc.) in many controllers. |
| `ViewBag` | Current request | `OrderController.cs:67-69` (`ViewBag.TodayRevenue`). |
| `TempData["..."]` | Survives one redirect | Success/error messages across `RedirectToAction` boundaries. |

---

## 3. ASP.NET Core Hosting & Builder

The infrastructure that boots the app, registers services, and configures the HTTP request pipeline.

### 3.1 `WebApplicationBuilder`

**What it is:** The new minimal-host builder introduced in .NET 6+. Wraps `IConfiguration`, `IServiceCollection`, and `IWebHostEnvironment` setup.

**Namespace:** `Microsoft.AspNetCore.Builder`

**Used in our project:**
- `Program.cs:6` — `var builder = WebApplication.CreateBuilder(args);`

**Key members used:**
- `builder.Services` — for DI registration.
- `builder.Configuration` — for reading config.
- `builder.Build()` → `WebApplication`.

---

### 3.2 `WebApplication`

**What it is:** The built app. Combines `IApplicationBuilder` (middleware pipeline) and `IHost` (services + lifetime).

**Used in our project:** `Program.cs:38` — `var app = builder.Build();`

**Members used:**
- `app.Services` — for service location.
- `app.Environment.IsDevelopment()` — conditional pipeline.
- `app.UseExceptionHandler`, `app.UseHsts`, `app.UseHttpsRedirection`, `app.UseRouting`, `app.UseSession`, `app.UseAuthentication`, `app.UseAuthorization`, `app.MapStaticAssets`, `app.MapControllerRoute`, `app.Run`.

---

### 3.3 `IServiceCollection` & `IServiceProvider`

**What they are:** The DI container interfaces. `IServiceCollection` is the registration list; `IServiceProvider` resolves instances.

**Used in our project:**
- `Program.cs` (extensive) — `builder.Services.AddXxx(...)` registrations.
- `Program.cs:44,45,46,51` — `scope.ServiceProvider.GetRequiredService<T>()`.
- `Controllers/DashboardController.cs:40` — `scope.ServiceProvider.GetRequiredService<DemoSeederService>()`.

**DI lifetime methods used:**
| Method | Used For |
|--------|----------|
| `AddSingleton<T>` | Not used. |
| `AddScoped<T>` | Services tied to one HTTP request (all our services). |
| `AddTransient<T>` | Not used. |

---

### 3.4 `IServiceScopeFactory` & `IServiceScope`

**What they are:** `IServiceScopeFactory` creates new DI scopes; `IServiceScope` lets you resolve scoped services outside of an HTTP request.

**Why we use them:** Background `Task.Run` needs its own scope so the `DbContext` it uses is properly disposed.

**Used in our project:**
- `Controllers/DashboardController.cs:16,18,39,40` — injects `IServiceScopeFactory`, then `using var scope = _scopeFactory.CreateScope();`.
- `Program.cs:43` — same pattern inside the `--seed` branch.

---

### 3.5 `IConfiguration`

**What it is:** Read-only key/value config (env vars, appsettings.json, command-line, etc.).

**Why we use it:** Read the ML service URL.

**Used in our project:**
- `Services/ForecastService.cs:24` — `config["MlServiceUrl"] ?? "http://localhost:8000"`.
- `Program.cs:10` — `builder.Configuration.GetConnectionString("DefaultConnection")`.

---

### 3.6 `IWebHostEnvironment` (`app.Environment`)

**What it is:** Tells you the current hosting environment (Development, Staging, Production).

**Used in our project:**
- `Program.cs:104` — `if (!app.Environment.IsDevelopment())`.

---

### 3.7 Cookie Auth Configuration

**What it is:** `CookieAuthenticationOptions` lets us tweak the auth cookie behavior.

**Used in our project:** `Program.cs:31-36`:
```csharp
builder.Services.ConfigureApplicationCookie(options => {
    options.LoginPath = "/Auth/Login";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});
```

**Why:** 7-day persistent login, HttpOnly to block JS access, SameSite=Lax to allow top-level navigations from external sites (e.g. password-reset links).

---

## 4. Entity Framework Core

EF Core is our ORM — we write LINQ against `DbSet<>` and EF translates it to SQL.

### 4.1 `DbContext` & `AppDbContext`

**What it is:** The unit-of-work class that tracks entity changes, runs queries, and persists to the DB.

**Why we use it:** One class for all DB access; change tracking + LINQ + transactions.

**Used in our project:**
- `Data/AppDbContext.cs` — our own subclass.
- `Program.cs:9` — `AddDbContext<AppDbContext>` registers it as scoped.

---

### 4.2 `DbContextOptions<T>`

**What it is:** Configuration passed to `DbContext` (provider, connection string, logging, etc.).

**Used in our project:**
- `Program.cs:9-10` — `opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))`.

---

### 4.3 `DbSet<T>`

**What it is:** A queryable collection for a table. `IQueryable<T>` operations against it are translated to SQL.

**Used in our project (`Data/AppDbContext.cs:11-19`):**
```csharp
public DbSet<Store> Stores => Set<Store>();
public DbSet<StoreMember> StoreMembers => Set<StoreMember>();
public DbSet<Product> Products => Set<Product>();
public DbSet<Order> Orders => Set<Order>();
public DbSet<OrderItem> OrderItems => Set<OrderItem>();
public DbSet<Customer> Customers => Set<Customer>();
public DbSet<Expense> Expenses => Set<Expense>();
public DbSet<InventoryAlert> Alerts => Set<InventoryAlert>();
public DbSet<Forecast> Forecasts => Set<Forecast>();
```

---

### 4.4 `ModelBuilder` (Fluent API)

**What it is:** Lets us configure the EF model in `OnModelCreating` — keys, indexes, relationships, decimal precision, cascade behavior.

**Used in our project:** `Data/AppDbContext.cs:21-79`.

**Methods used:**
- `Entity<T>()` — get a config builder for an entity.
- `HasKey(...)` — composite primary key (`StoreMember`).
- `HasOne(...).WithMany(...).HasForeignKey(...).OnDelete(DeleteBehavior.Restrict)` — relationships.
- `Property(...).HasPrecision(18, 2)` — decimal columns.
- `HasIndex(...).IsUnique()` — performance indexes + dedup.

---

### 4.5 `IQueryable<T>` and LINQ Query Operators

**What it is:** Deferred-execution query. EF translates the expression tree to SQL when enumerated.

**Used in our project:** Every controller and service.

**Common operators:**
| Operator | Translation |
|----------|-------------|
| `Where(predicate)` | `WHERE` |
| `Select(projection)` | `SELECT` |
| `OrderBy`, `OrderByDescending` | `ORDER BY` |
| `GroupBy(key).Select(g => new { ... })` | `GROUP BY` |
| `Join(inner, outerKey, innerKey, result)` | `INNER JOIN` |
| `Concat(second)` | `UNION ALL` |
| `Include(nav).ThenInclude(nav2)` | Eager loading (`JOIN`). |
| `AsNoTracking()` | Skip change tracking (read-only queries). |
| `Contains(value)` | `IN (...)` or `LIKE '%...%'` (on strings). |
| `Skip(n).Take(m)` | `OFFSET ... FETCH NEXT ...` for pagination. |
| `FirstOrDefault`, `SingleOrDefault`, `Any` | Scalar query. |

---

### 4.6 Async LINQ (`ToListAsync`, `FirstOrDefaultAsync`, etc.)

**What it is:** The async versions of the LINQ operators — they actually hit the DB asynchronously.

**Used everywhere.** Key methods:
- `ToListAsync()` — materializes a list.
- `FirstOrDefaultAsync(predicate)` — find one or null.
- `SingleOrDefaultAsync(predicate)` — find one or null (throws if more than one).
- `CountAsync(predicate)` — count.
- `SumAsync(selector)` — sum.
- `AnyAsync(predicate)` — existence check.
- `FirstAsync(predicate)` — find one (throws if none).
- `ToDictionaryAsync(keySelector)` — build a dictionary (e.g. `OrderService.cs:95,205` for batch-fetching products to avoid N+1).

---

### 4.7 `IDbContextTransaction` & `BeginTransactionAsync`

**What it is:** An explicit DB transaction so we can commit/rollback multiple operations atomically.

**Why we use it:** Order creation must deduct stock + create order + update customer atomically. If anything fails, nothing is persisted.

**Used in our project:**
- `Services/OrderService.cs:45,57,101,107,116,160,166,198,228,240,246` — full transaction wrapping in `CreateOrderAsync` and `ChangeOrderStatusAsync`.
- `Controllers/AuthController.cs:78,104,119,147,162,169` — same for signup and store creation.
- `Controllers/SettingsController.cs:202,216,222,232,257,271,292` — same for store deletion and employee invite.

**Pattern:**
```csharp
using var transaction = await _db.Database.BeginTransactionAsync();
try
{
    // ... mutations ...
    await _db.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch (Exception)
{
    await transaction.RollbackAsync();
}
```

---

### 4.8 `ExecuteSqlRawAsync` & `SqlParameter`

**What it is:** Escape hatch for raw SQL when LINQ can't express what we need.

**Why we use it:** Store deletion cascades across many tables; we need ordered raw `DELETE` statements to avoid FK constraint errors.

**Used in our project:**
- `Controllers/SettingsController.cs:260-269` — bulk store deletion.
- `Microsoft.Data.SqlClient.SqlParameter` for safe parameterization.

```csharp
var storeIdParam = new SqlParameter("storeId", storeId);
await Db.Database.ExecuteSqlRawAsync("DELETE FROM Forecasts WHERE StoreId = @storeId", storeIdParam);
```

---

### 4.9 `ChangeTracker` & `AutoDetectChangesEnabled`

**What it is:** EF's change-detection machinery for the entities loaded into the context.

**Why we use it:** Performance — when bulk-inserting ~10,000 orders, we disable auto-detect to ~5–10× speed up.

**Used in our project:**
- `Services/DemoSeederService.cs:242,308,314` — `_db.ChangeTracker.AutoDetectChangesEnabled = false;` and `_db.ChangeTracker.Clear();` between batches.

---

### 4.10 `DbUpdateException`

**What it is:** Exception thrown by `SaveChangesAsync` when the DB rejects the change (e.g. unique-index violation).

**Why we use it:** Concurrent dashboard requests can race to insert the same forecast cache row. We swallow this exception because the cache is already populated by the other request.

**Used in our project:**
- `Services/AnalyticsService.cs:198,314` — caught and logged at debug level.

---

## 5. HTTP & Networking

How we talk to the Python ML service and how we read uploaded files.

### 5.1 `HttpClient`

**What it is:** The modern async HTTP client. We inject it via `IHttpClientFactory` (typed-client pattern).

**Why we use it:** Call the Python ML FastAPI service.

**Used in our project:**
- `Services/ForecastService.cs:16,23,44,65` — `PostAsJsonAsync`, `GetAsync`.

---

### 5.2 `IHttpClientFactory` & `AddHttpClient<T>`

**What it is:** The factory pattern that pools `HttpClient` instances, avoiding socket exhaustion.

**Used in our project:**
- `Program.cs:26-29` — `builder.Services.AddHttpClient<SellWise.Web.Services.ForecastService>(...)` (typed-client registration).
- `Services/ForecastService.cs:20` — constructor receives the `HttpClient`.

**Configured timeout:** `TimeSpan.FromSeconds(5)` — so a cold Prophet call won't hang the dashboard.

---

### 5.3 `HttpResponseMessage`

**What it is:** Represents the HTTP response.

**Used in our project:**
- `Services/ForecastService.cs:44-66` — `response.IsSuccessStatusCode`, `response.StatusCode`, `response.Content.ReadFromJsonAsync<T>()`.

---

### 5.4 `PostAsJsonAsync` & `ReadFromJsonAsync` (Extensions)

**What they are:** Extension methods in `System.Net.Http.Json` for sending/receiving JSON without manual serialization.

**Namespace:** `System.Net.Http.Json`

**Used in our project:**
- `Services/ForecastService.cs:44` — `_http.PostAsJsonAsync(url, request)`.
- `Services/ForecastService.cs:49` — `response.Content.ReadFromJsonAsync<ForecastResponse>()`.

---

### 5.5 `Stream` & `StreamReader`

**What they are:** Reading the uploaded CSV file row by row.

**Used in our project:**
- `Controllers/OrderController.cs:254,263` — `file.OpenReadStream()`, `StreamReader.ReadLineAsync()`.
- `Services/ProductService.cs:77,82` — same.

```csharp
using var reader = new StreamReader(file.OpenReadStream());
while ((line = await reader.ReadLineAsync()) != null) { ... }
```

---

## 6. Session, Cache & Logging

### 6.1 `ISession` (`HttpContext.Session`)

**What it is:** Per-user key/value store backed by a cookie or distributed cache. Survives across requests for the same browser.

**Why we use it:** Store the "currently active store" so every controller can read it without a DB hit.

**Used in our project:**

| Method | Where | Purpose |
|--------|-------|---------|
| `Session.GetString("ActiveStoreId")` | `BaseController.cs:26`; `AuthController.cs:206,224` | Read current store. |
| `Session.SetString("ActiveStoreId", ...)` | `AuthController.cs:54,107,164,191,224`; `SettingsController.cs:280` | Set current store. |
| `Session.Remove("ActiveStoreId")` | `BaseController.cs:50`; `SettingsController.cs:284` | Clear invalid store. |
| `Session.Clear()` | `AuthController.cs:131` | Logout — wipe all session data. |

**Configured at:** `Program.cs:16,113` — `AddSession()` + `UseSession()`.

---

### 6.2 `IMemoryCache` & `AddMemoryCache`

**What it is:** In-process cache. We register it because some framework components need it.

**Used in our project:** `Program.cs:15` — `builder.Services.AddMemoryCache();` (we don't directly use `IMemoryCache`; it's there because the framework expects it).

---

### 6.3 `ILogger<T>` & Logging Extensions

**What it is:** The standard .NET logging abstraction. We inject `ILogger<TService>` into services.

**Why we use it:** Structured logging for warnings/errors.

**Used in our project (every service & controller):**
- `_logger.LogError(ex, "...")` — exception + message.
- `_logger.LogWarning(ex, "...")` — non-fatal issues.
- `_logger.LogDebug(ex, "...")` — verbose info.
- `_logger.LogInformation("...")` — for seed messages.

**Example:** `Services/AnalyticsService.cs:56` — `_logger.LogWarning(ex, "Failed to get forecast...")`.

---

### 6.4 `ClaimsPrincipal` (Auth-related, repeated from §1.7)

The current user, available as `Controller.User`.

**Used in our project:**
- `BaseController.cs:36` — `User.FindFirst(userId)?.Value`.
- `AuthController.cs:204` — `User.Identity?.IsAuthenticated`.
- `DashboardController.cs:34` — `User.Identity?.Name == "admin@sellwise.com"` (demo auto-seed check).

---

### 6.5 `System.Security.Claims.ClaimTypes`

**What it is:** The string constants for standard claim names.

**Used in our project:** `BaseController.cs:35` — `var userId = System.Security.Claims.ClaimTypes.NameIdentifier;`

---

## 7. System.* Utilities

### 7.1 `DateTime` & `DateTimeOffset`

**What it is:** Represents an instant in time. We always store `DateTime.UtcNow` for time-zone safety.

**Methods used everywhere:**

| Call | Purpose |
|------|---------|
| `DateTime.UtcNow` | Current UTC instant (e.g. `CreatedAt`, `UpdatedAt`, `OrderDate`). |
| `DateTime.UtcNow.Date` | Midnight today (for "today" filters). |
| `dt.AddDays(n)`, `AddMonths(n)`, `AddYears(n)` | Date math for ranges. |
| `dt.ToString("MMM dd")`, `("MMM dd, yyyy HH:mm")` | Display formatting. |
| `dt.Date` | Strip the time component. |
| `DateTime.TryParse(string, out var)` | Safe parsing in CSV import. |

**Examples:**
- `OrderController.cs:42` — `var today = DateTime.UtcNow.Date;`
- `OrderService.cs:86` — `$"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}"`.

---

### 7.2 `TimeSpan`

**What it is:** Represents a duration.

**Used in our project:**
- `Program.cs:28` — `client.Timeout = TimeSpan.FromSeconds(5);`
- `Program.cs:33` — `options.ExpireTimeSpan = TimeSpan.FromDays(7);`

---

### 7.3 `Guid`

**What it is:** 128-bit unique identifier. We use it for all PKs and FKs.

**Methods used:**
- `Guid.NewGuid()` — generate a new one.
- `Guid.Empty` — the zero `Guid` (used as "no store" sentinel).
- `Guid.TryParse(string, out var)` — safe parse from session.
- `guid.ToString()[..6]` — substring (used in order-number generation).

**Used in our project:** Every model and service.

---

### 7.4 `Math`

**Methods used:**
- `Math.Max(a, b)` — clamp lower bound (`OrderController.cs:34`, `AnalyticsService.cs:323`, etc.).
- `Math.Ceiling(x)` — round up for total-pages calculation.
- `Math.Floor(x)` — round down (days-of-cover).
- `Math.Round(x, digits)` — display rounding.
- `Math.Clamp(value, min, max)` — health score clamping.
- `Math.Abs(x)` — absolute value.

---

### 7.5 `Random`

**What it is:** PRNG for demo-data generation.

**Used in our project:** `Services/DemoSeederService.cs:23,47,76,77,78,79,253,263,267,270,272,273,305,334,351,362,370` — seeded with `42` for store 1 and `99` for store 2 for deterministic seeding.

---

### 7.6 `DayOfWeek` (Enum)

**What it is:** Built-in enum: `Sunday` ... `Saturday`.

**Used in our project:** `Services/DemoSeederService.cs:248` — `bool isWeekend = currentDate.DayOfWeek == DayOfWeek.Friday || currentDate.DayOfWeek == DayOfWeek.Saturday;` (Bangladesh weekend).

---

### 7.7 `Uri`

**What it is:** URL utilities.

**Used in our project:** `Controllers/SearchController.cs:38,50,62` — `Uri.EscapeDataString(name)` to build safe query-string URLs.

---

### 7.8 `Exception` & `InvalidOperationException`

**What they are:** Standard exception types.

**Used in our project:**
- `catch (Exception ex)` — general error handling in services.
- `throw new InvalidOperationException("...")` — domain errors in services (`CustomerService.cs:21`, `ProductService.cs:48`).

---

### 7.9 `Console`

**What it is:** Standard output for the `--seed` CLI mode.

**Used in our project:** `Program.cs:57,60,78,80,95,97,99` — `Console.WriteLine("[INFO] ...")`.

---

### 7.10 `List<T>` & `Dictionary<TKey, TValue>`

**What they are:** The two collection types we use most.

**Used in our project:**
- `List<T>` — every collection materialized from EF.
- `Dictionary<TKey, TValue>` — `OrderController.cs:260` (customer lookup by phone), `OrderService.cs:95,205` (product lookup by ID, batch-fetched to avoid N+1).

---

### 7.11 `StringBuilder`

**What it is:** Mutable string for efficient concatenation.

**Used in our project:**
- `Controllers/OrderController.cs:344` — `var currentField = new System.Text.StringBuilder();` (CSV parser).
- `Services/ProductService.cs:143` — same.

---

### 7.12 `System.Text.Json.JsonSerializer`

**What it is:** Built-in JSON serializer (faster than Newtonsoft).

**Used in our project:**
- `Controllers/OrderController.cs:234,235` — `System.Text.Json.JsonSerializer.Serialize(products)` — passes product/customer lists to JS via the view model.

---

### 7.13 `System.Linq` (Enumerable & Queryable)

**What it is:** LINQ standard query operators.

**Most-used methods:**

| Method | Category | Where |
|--------|----------|-------|
| `Where` | Filter | All over |
| `Select` | Project | All over |
| `OrderBy` / `OrderByDescending` | Sort | Pagination |
| `GroupBy(...).Select(g => new {...})` | Aggregate | Analytics |
| `Join` | Combine | Analytics (`AnalyticsService.cs:145,261`) |
| `Concat` | Combine | Analytics |
| `Sum` | Aggregate | KPIs |
| `Count` | Aggregate | Pagination |
| `Average` | Aggregate | Forecast |
| `Take` / `Skip` | Pagination | Every list view |
| `ToList` | Materialize | End of every query |
| `ToDictionary` | Materialize | Batch fetch |
| `Any` | Existence | `Db.Products.Any(...)` |
| `FirstOrDefault` | Single | Lookups |
| `SingleOrDefault` | Single | Lookups (throws on >1) |
| `Distinct` | Dedupe | Order line de-dup |
| `Contains` | Membership | Bulk operations |
| `DefaultIfEmpty` | Defensive | Sparkline math |

---

### 7.14 `System.Threading.Tasks`

**What it is:** The TPL — `Task`, `Task<T>`, async/await.

**Used in our project:**
- `Task<T>` — return type of every async method.
- `Task.Run(...)` — `Controllers/DashboardController.cs:37` — fire-and-forget background seed.
- `Task.WhenAll(tasks)` — `Services/AnalyticsService.cs:185,301` — fan-out to compute multiple product forecasts concurrently.

---

### 7.15 `System.IO.StreamReader`

**Already covered in §5.5.**

---

## 8. Third-Party Libraries

### 8.1 QuestPDF

**What it is:** Fluent C# library for generating PDF documents.

**Used in our project:** `Controllers/ReportController.cs`.

| Method | Where | Purpose |
|--------|-------|---------|
| `Document.Create(container => ...)` | `ReportController.cs:57` | Build document. |
| `container.Page(...)` | `ReportController.cs:59` | Define a page. |
| `PageSizes.A4` | `ReportController.cs:61` | Standard A4 size. |
| `Colors.White`, `Colors.Blue.Darken2`, `Colors.Grey.Lighten2`, etc. | Throughout | Color palette. |
| `LicenseType.Community` | `ReportController.cs:20` | Free license. |
| `document.GeneratePdf()` | `ReportController.cs:147` | Serialize to byte[]. |
| `File(pdfBytes, "application/pdf", fileName)` | `ReportController.cs:148` | Send as download. |

**Why:** Reports need to be exportable as PDF for printing/sharing.

---

### 8.2 SellWise.ML (Python FastAPI Service)

**What it is:** A separate Python microservice running Prophet for time-series forecasting.

**Used in our project:** `Services/ForecastService.cs` calls it over HTTP.

**Contract:**
- `POST http://localhost:8000/api/v1/ml/forecast` — body `{store_id, product_id, history: [{ds, y}], periods}` → `{forecast: [{ds, yhat, yhat_lower, yhat_upper}]}`.

**Fallback:** If the call fails or times out (>5s), `AnalyticsService` uses a 30-day moving average as a fallback forecast.

---

## 9. Cheat Sheet — Quick Lookup

### 9.1 Most Common Operations → Built-in Methods

| Want to... | Use |
|------------|-----|
| Create user with hashed password | `await _userManager.CreateAsync(user, password)` |
| Sign user in (issue cookie) | `await _signInManager.PasswordSignInAsync(...)` |
| Sign user out | `await _signInManager.SignOutAsync()` |
| Get current user | `await _userManager.GetUserAsync(User)` |
| Get current user ID | `_userManager.GetUserId(User)` |
| Validate `[Authorize]` | `[Authorize]` attribute on controller/action |
| CSRF protection | `[AutoValidateAntiforgeryToken]` or `[ValidateAntiForgeryToken]` |
| Read form values in action | Just use parameter (model binding) |
| Validate input | `[Required]`, etc. on model + `ModelState.IsValid` |
| Read query string | Action parameter (e.g. `Index(string search)`) |
| Read route value | `{id}` in route + `Guid id` param |
| Read uploaded file | `IFormFile file` param |
| Return view | `return View(model)` |
| Return JSON | `return Json(obj)` |
| Return partial | `return PartialView("_Name", model)` |
| Redirect | `return RedirectToAction("Index", "Controller")` |
| Pass data to view (one request) | `ViewData["Key"] = ...` or `ViewBag.Key = ...` |
| Pass data across redirect | `TempData["Key"] = ...` |
| Run code before every action | Override `OnActionExecutionAsync` in base controller |
| Atomic multi-step DB | `BeginTransactionAsync` / `CommitAsync` / `RollbackAsync` |
| Get all rows of table | `await Db.Entity.ToListAsync()` |
| Find by PK | `await Db.Entity.FirstOrDefaultAsync(e => e.Id == id)` |
| Check existence | `await Db.Entity.AnyAsync(predicate)` |
| Count | `await Db.Entity.CountAsync()` |
| Sum | `await Db.Entity.SumAsync(e => e.Field)` |
| Paginate | `.Skip((page-1)*size).Take(size)` |
| Eager-load navigation | `.Include(e => e.Nav).ThenInclude(n => n.SubNav)` |
| Read-only query | `.AsNoTracking()` |
| Raw SQL | `Db.Database.ExecuteSqlRawAsync(sql, params)` |
| Get config value | `config["Key"] ?? "default"` |
| Resolve service outside request | `using var scope = factory.CreateScope(); scope.ServiceProvider.GetRequiredService<T>();` |
| HTTP call | `await http.PostAsJsonAsync(url, body)` / `await response.Content.ReadFromJsonAsync<T>()` |
| Log exception | `_logger.LogError(ex, "message")` |
| Generate Guid | `Guid.NewGuid()` |
| UTC now | `DateTime.UtcNow` |
| Round up/down | `Math.Ceiling(x)` / `Math.Floor(x)` |
| Clamp | `Math.Clamp(v, min, max)` |
| Random with seed | `new Random(seed).Next(n)` |
| Escape query string | `Uri.EscapeDataString(s)` |
| File upload stream | `file.OpenReadStream()` → `StreamReader` → `ReadLineAsync()` |
| Build complex string | `new StringBuilder()` + `Append` |
| Serialize to JSON | `System.Text.Json.JsonSerializer.Serialize(obj)` |

---

### 9.2 Where Each "Big Idea" Lives

| Concept | File(s) |
|---------|---------|
| App startup & DI | `Program.cs` |
| Multi-tenant enforcement | `Controllers/BaseController.cs` |
| Auth (login/signup/logout) | `Controllers/AuthController.cs` |
| Dashboard / analytics | `Controllers/DashboardController.cs` + `Services/AnalyticsService.cs` |
| Products CRUD | `Controllers/ProductController.cs` + `Services/ProductService.cs` |
| Orders CRUD | `Controllers/OrderController.cs` + `Services/OrderService.cs` |
| Customers + RFM | `Controllers/CustomerController.cs` + `Services/CustomerService.cs` + `Services/RfmService.cs` |
| Inventory alerts | `Controllers/AlertController.cs` + `Services/AlertService.cs` |
| Expenses | `Controllers/ExpenseController.cs` + `Services/ExpenseService.cs` |
| Reports + PDF | `Controllers/ReportController.cs` |
| ML forecast | `Services/ForecastService.cs` (calls Python service) |
| Search | `Controllers/SearchController.cs` |
| Settings / staff | `Controllers/SettingsController.cs` |
| DB schema & seed | `Data/AppDbContext.cs` + `Services/DemoSeederService.cs` |

---

## Study Plan

If you want to learn these in order, here's a suggested path:

1. **C# fundamentals** — `DateTime`, `Guid`, `Math`, `string`, `List<T>`, `Dictionary<T,T>`, `StringBuilder`.
2. **LINQ** — `Where`, `Select`, `OrderBy`, `GroupBy`, `Join`, `Sum`, `Any`, `FirstOrDefault`, `ToList`.
3. **async/await + Task** — every controller is `async Task<IActionResult>`.
4. **ASP.NET Core MVC** — `Controller`, `IActionResult`, attributes, `ModelState`, `ViewData`/`ViewBag`/`TempData`.
5. **EF Core basics** — `DbContext`, `DbSet`, `IQueryable`, async LINQ operators.
6. **EF Core relationships & fluent config** — `ModelBuilder`, `HasOne/WithMany/HasForeignKey`, indexes.
7. **EF Core transactions** — `BeginTransactionAsync/CommitAsync/RollbackAsync`.
8. **Identity** — `UserManager`, `SignInManager`, `IdentityDbContext`, `[Authorize]`, cookie auth.
9. **Hosting & DI** — `WebApplicationBuilder`, `IServiceCollection`, `IServiceScopeFactory`.
10. **HttpClient + IHttpClientFactory** — `PostAsJsonAsync` / `ReadFromJsonAsync`.
11. **Logging** — `ILogger<T>`, `LogError/LogWarning/LogDebug`.
12. **Session** — `ISession`, `GetString/SetString/Remove`.
13. **QuestPDF** — fluent PDF API.
14. **ClaimTypes & ClaimsPrincipal** — extracting user info from cookies.

After each section, re-read the relevant source files and find the call site to see it in context.
