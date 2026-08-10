using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
})
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddMemoryCache();
builder.Services.AddSession();
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<SellWise.Web.Services.AnalyticsService>();
builder.Services.AddScoped<SellWise.Web.Services.DemoSeederService>();
builder.Services.AddScoped<SellWise.Web.Services.IOrderService, SellWise.Web.Services.OrderService>();
builder.Services.AddScoped<SellWise.Web.Services.IAlertService, SellWise.Web.Services.AlertService>();
builder.Services.AddScoped<SellWise.Web.Services.IRfmService, SellWise.Web.Services.RfmService>();
builder.Services.AddHttpClient<SellWise.Web.Services.ForecastService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.ConfigureApplicationCookie(options => {
    options.LoginPath = "/Auth/Login";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

var app = builder.Build();

// CLI Data Seeder
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ApplicationUser>>();
    var seeder = scope.ServiceProvider.GetRequiredService<SellWise.Web.Services.DemoSeederService>();

    const string adminEmail = "admin@sellwise.com";

    // Ensure admin user exists
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser { UserName = adminEmail, Email = adminEmail };
        var result = await userManager.CreateAsync(adminUser, "Admin123!");
        if (result.Succeeded)
            Console.WriteLine($"[INFO] Created admin user: {adminEmail} / Admin123!");
        else
        {
            Console.WriteLine($"[ERROR] Failed to create admin: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            return;
        }
    }

    // --- Store 1: SellWise Tech BD (electronics) ---
    var store1 = db.Stores.FirstOrDefault(s => s.Name == "SellWise Tech BD");
    if (store1 == null)
    {
        store1 = new SellWise.Web.Models.Store { Id = Guid.NewGuid(), Name = "SellWise Tech BD", CreatedAt = DateTime.UtcNow };
        db.Stores.Add(store1);
        await db.SaveChangesAsync();
    }
    if (!db.StoreMembers.Any(m => m.StoreId == store1.Id && m.UserId == adminUser.Id))
    {
        db.StoreMembers.Add(new StoreMember { StoreId = store1.Id, UserId = adminUser.Id, Role = "owner" });
        await db.SaveChangesAsync();
    }
    Console.WriteLine($"[INFO] Seeding Store 1: {store1.Name}...");
    await seeder.SeedStoreAsync(store1.Id, randomSeed: 42);
    Console.WriteLine($"[OK]   Store 1 done.");

    // --- Store 2: StyleHub BD (fashion/clothing) ---
    var store2 = db.Stores.FirstOrDefault(s => s.Name == "StyleHub BD");
    if (store2 == null)
    {
        store2 = new SellWise.Web.Models.Store { Id = Guid.NewGuid(), Name = "StyleHub BD", CreatedAt = DateTime.UtcNow };
        db.Stores.Add(store2);
        await db.SaveChangesAsync();
    }
    if (!db.StoreMembers.Any(m => m.StoreId == store2.Id && m.UserId == adminUser.Id))
    {
        db.StoreMembers.Add(new StoreMember { StoreId = store2.Id, UserId = adminUser.Id, Role = "owner" });
        await db.SaveChangesAsync();
    }
    Console.WriteLine($"[INFO] Seeding Store 2: {store2.Name}...");
    await seeder.SeedSecondStoreAsync(store2.Id, randomSeed: 99);
    Console.WriteLine($"[OK]   Store 2 done.");

    Console.WriteLine("[SUCCESS] All stores seeded. Login: admin@sellwise.com / Admin123!");
    return;
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
