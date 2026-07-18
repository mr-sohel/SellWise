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
builder.Services.AddHttpClient<SellWise.Web.Services.ForecastService>();

builder.Services.ConfigureApplicationCookie(options => {
    options.LoginPath = "/Auth/Login";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
});

var app = builder.Build();

// CLI Data Seeder
if (args.Contains("--seed"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var seeder = scope.ServiceProvider.GetRequiredService<SellWise.Web.Services.DemoSeederService>();
    
    // Grab the first available store to seed (or create one if none exist)
    var store = db.Stores.FirstOrDefault();
    if (store == null)
    {
        store = new SellWise.Web.Models.Store { Id = Guid.NewGuid(), Name = "Demo Store", CreatedAt = DateTime.UtcNow };
        db.Stores.Add(store);
        db.SaveChanges();
    }
    
    Console.WriteLine($"🌱 Seeding data for Store: {store.Name} ({store.Id})...");
    seeder.SeedStoreAsync(store.Id).Wait();
    Console.WriteLine("✅ Data seeded successfully!");
    
    // Exit application after seeding
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

app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
