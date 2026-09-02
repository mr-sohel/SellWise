using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    var config = services.GetRequiredService<IConfiguration>();

    int retries = 10;
    while (retries > 0)
    {
        try
        {
            var defaultConn = config.GetConnectionString("DefaultConnection") ?? "";
            if (!string.IsNullOrEmpty(defaultConn))
            {
                // 1. Connect to 'master' to ensure 'SellWise' database exists
                var masterBuilder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(defaultConn)
                {
                    InitialCatalog = "master"
                };

                logger.LogInformation("[STARTUP] Checking if 'SellWise' database exists via master...");
                using (var masterConn = new Microsoft.Data.SqlClient.SqlConnection(masterBuilder.ConnectionString))
                {
                    masterConn.Open();
                    using var cmd = masterConn.CreateCommand();
                    cmd.CommandText = @"
                        IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'SellWise')
                        BEGIN
                            CREATE DATABASE [SellWise];
                        END";
                    cmd.ExecuteNonQuery();
                }
                logger.LogInformation("[STARTUP] Database 'SellWise' confirmed/created.");

                // 2. Apply EF Core migrations
                var db = services.GetRequiredService<AppDbContext>();
                logger.LogInformation("[STARTUP] Applying database migrations...");
                db.Database.Migrate();
                logger.LogInformation("[STARTUP] Database migrations verified/applied.");

                // 3. Ensure default admin and demo stores exist
                var userManager = services.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ApplicationUser>>();
                var seeder = services.GetRequiredService<SellWise.Web.Services.DemoSeederService>();

                const string adminEmail = "admin@sellwise.com";
                var adminUser = userManager.FindByEmailAsync(adminEmail).GetAwaiter().GetResult();
                if (adminUser == null)
                {
                    logger.LogInformation("[STARTUP] Initializing default admin user ({AdminEmail})...", adminEmail);
                    adminUser = new ApplicationUser { UserName = adminEmail, Email = adminEmail, OwnerName = "Admin" };
                    var result = userManager.CreateAsync(adminUser, "Admin123!").GetAwaiter().GetResult();
                    if (result.Succeeded)
                    {
                        // Store 1: SellWise Tech BD (electronics)
                        var store1 = db.Stores.FirstOrDefault(s => s.Name == "SellWise Tech BD");
                        if (store1 == null)
                        {
                            store1 = new SellWise.Web.Models.Store { Id = Guid.NewGuid(), Name = "SellWise Tech BD", CreatedAt = DateTime.UtcNow };
                            db.Stores.Add(store1);
                            db.SaveChanges();
                        }
                        if (!db.StoreMembers.Any(m => m.StoreId == store1.Id && m.UserId == adminUser.Id))
                        {
                            db.StoreMembers.Add(new StoreMember { StoreId = store1.Id, UserId = adminUser.Id, Role = "owner" });
                            db.SaveChanges();
                        }
                        seeder.SeedStoreAsync(store1.Id, randomSeed: 42).GetAwaiter().GetResult();

                        // Store 2: StyleHub BD (fashion/clothing)
                        var store2 = db.Stores.FirstOrDefault(s => s.Name == "StyleHub BD");
                        if (store2 == null)
                        {
                            store2 = new SellWise.Web.Models.Store { Id = Guid.NewGuid(), Name = "StyleHub BD", CreatedAt = DateTime.UtcNow };
                            db.Stores.Add(store2);
                            db.SaveChanges();
                        }
                        if (!db.StoreMembers.Any(m => m.StoreId == store2.Id && m.UserId == adminUser.Id))
                        {
                            db.StoreMembers.Add(new StoreMember { StoreId = store2.Id, UserId = adminUser.Id, Role = "owner" });
                            db.SaveChanges();
                        }
                        seeder.SeedSecondStoreAsync(store2.Id, randomSeed: 99).GetAwaiter().GetResult();
                        logger.LogInformation("[STARTUP] Default admin & demo stores seeded successfully.");
                    }
                }

                // If we reached here, startup database initialization succeeded!
                break;
            }
        }
        catch (Exception ex)
        {
            retries--;
            logger.LogWarning(ex, "[STARTUP] Waiting for database to be ready ({Retries} retries left)...", retries);
            if (retries == 0)
            {
                logger.LogError(ex, "[STARTUP] Exhausted retries for database initialization.");
            }
            else
            {
                Thread.Sleep(3000);
            }
        }
    }

    if (args.Contains("--seed"))
    {
        Console.WriteLine("[CLI] Explicit --seed completed.");
        return;
    }
}

// Configure the HTTP request pipeline.
app.UseDeveloperExceptionPage();
app.UseHsts();

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

