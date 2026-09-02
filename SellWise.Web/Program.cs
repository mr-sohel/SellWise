using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null)));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddMemoryCache();
builder.Services.AddSession();
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<SellWise.Web.Services.AnalyticsService>();
builder.Services.AddScoped<SellWise.Web.Services.DemoSeederService>();
builder.Services.AddScoped<SellWise.Web.Services.IOrderService, SellWise.Web.Services.OrderService>();
builder.Services.AddScoped<SellWise.Web.Services.IAlertService, SellWise.Web.Services.AlertService>();
builder.Services.AddScoped<SellWise.Web.Services.IRfmService, SellWise.Web.Services.RfmService>();
builder.Services.AddScoped<SellWise.Web.Services.IProductService, SellWise.Web.Services.ProductService>();
builder.Services.AddScoped<SellWise.Web.Services.ICustomerService, SellWise.Web.Services.CustomerService>();
builder.Services.AddScoped<SellWise.Web.Services.IExpenseService, SellWise.Web.Services.ExpenseService>();
builder.Services.AddHttpClient<SellWise.Web.Services.ForecastService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.ConfigureApplicationCookie(options => {
    options.LoginPath = "/Auth/Login";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

var app = builder.Build();

// Auto-migrate database and ensure default admin & stores exist
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("[STARTUP] Applying database migrations if needed...");
        db.Database.Migrate();
        logger.LogInformation("[STARTUP] Database migrations verified/applied.");

        var userManager = services.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ApplicationUser>>();
        var seeder = services.GetRequiredService<SellWise.Web.Services.DemoSeederService>();

        const string adminEmail = "admin@sellwise.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            logger.LogInformation("[STARTUP] Initializing default admin user ({AdminEmail})...", adminEmail);
            adminUser = new ApplicationUser { UserName = adminEmail, Email = adminEmail, OwnerName = "Admin" };
            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                // Store 1: SellWise Tech BD (electronics)
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
                await seeder.SeedStoreAsync(store1.Id, randomSeed: 42);

                // Store 2: StyleHub BD (fashion/clothing)
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
                await seeder.SeedSecondStoreAsync(store2.Id, randomSeed: 99);
                logger.LogInformation("[STARTUP] Default admin & demo stores seeded successfully.");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "[STARTUP] Database migration/seed encountered an error. The app will continue starting.");
    }

    if (args.Contains("--seed"))
    {
        Console.WriteLine("[CLI] Explicit --seed completed.");
        return;
    }
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

