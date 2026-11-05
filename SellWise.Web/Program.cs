using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.Services;

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    })
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Auth/Login";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// In Docker, keep the key ring on a volume so restarts don't log everyone out.
var keysPath = builder.Configuration["DataProtection:KeysPath"];
if (!string.IsNullOrEmpty(keysPath))
    builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(keysPath));

// Behind Caddy the app sees plain HTTP; trust X-Forwarded-* so it knows the real scheme.
// The web container is only reachable through the proxy, so any forwarder is trusted.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddSession();
builder.Services.AddControllersWithViews();

builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<DemoSeederService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<IRfmService, RfmService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddHttpClient<ForecastService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["MlServiceUrl"] ?? "http://localhost:8000/");
    // Prophet usually answers in 1-3s; give up early so a down ML service doesn't stall the dashboard.
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

// Demo data is on by default in Development. In production it must be enabled explicitly
// (DemoData__Enabled=true) and given a password through configuration.
var demoOptions = app.Configuration.GetSection("DemoData").Get<DemoDataOptions>() ?? new DemoDataOptions();
if (app.Environment.IsDevelopment())
{
    demoOptions.Enabled = app.Configuration.GetValue("DemoData:Enabled", true);
    demoOptions.AdminPassword ??= "Admin123!";
}

using (var scope = app.Services.CreateScope())
{
    await DatabaseInitializer.InitializeAsync(scope.ServiceProvider, demoOptions);
}

if (args.Contains("--seed"))
{
    Console.WriteLine("Database migrated and seeded.");
    return;
}

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

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
