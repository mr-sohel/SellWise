using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.Models;
using Testcontainers.MsSql;

namespace SellWise.Tests.Integration;

/// <summary>
/// Runs the real web app in memory against a throwaway SQL Server container (requires Docker).
/// </summary>
public sealed class SellWiseAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string Password = "Passw0rd!";
    public const string OwnerA = "owner-a@test.com";
    public const string OwnerB = "owner-b@test.com";
    public const string StaffA = "staff-a@test.com";

    private readonly MsSqlContainer _sql = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    public Guid StoreAProductId { get; private set; }
    public Guid StoreBProductId { get; private set; }
    public Guid StoreBCustomerId { get; private set; }
    public Guid StoreBOrderId { get; private set; }
    public Guid StoreBId { get; private set; }
    public Guid StoreAId { get; private set; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", _sql.GetConnectionString() + ";Database=SellWiseTests");
        builder.UseSetting("DemoData:Enabled", "false");

        // Tests send many requests from one "IP"; real limits are covered in RateLimitingTests.
        builder.UseSetting("RateLimiting:GlobalBurst", "100000");
        builder.UseSetting("RateLimiting:GlobalPerTenSeconds", "100000");
        builder.UseSetting("RateLimiting:AuthPerMinute", "100000");
        builder.UseSetting("RateLimiting:ExpensivePerMinute", "100000");
    }

    public async Task InitializeAsync()
    {
        await _sql.StartAsync();

        // Resolving Services starts the app, which runs migrations against the container.
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var storeA = new Store { Name = "Store A" };
        var storeB = new Store { Name = "Store B" };
        db.Stores.AddRange(storeA, storeB);
        StoreBId = storeB.Id;
        StoreAId = storeA.Id;

        await AddMemberAsync(db, users, OwnerA, storeA, StoreRoles.Owner);
        await AddMemberAsync(db, users, OwnerB, storeB, StoreRoles.Owner);
        await AddMemberAsync(db, users, StaffA, storeA, StoreRoles.Staff);

        var productA = new Product { StoreId = storeA.Id, Name = "A-Product", SellingPrice = 100, CostPrice = 50, StockQuantity = 10 };
        var productB = new Product { StoreId = storeB.Id, Name = "B-Secret-Product", SellingPrice = 100, CostPrice = 50, StockQuantity = 10 };
        var customerB = new Customer { StoreId = storeB.Id, Name = "B-Secret-Customer" };
        var orderB = new Order
        {
            StoreId = storeB.Id,
            Customer = customerB,
            OrderNumber = "ORD-B-SECRET",
            Status = "pending",
            OrderType = "online",
            Total = 100,
            Items = { new OrderItem { ProductId = productB.Id, ProductName = productB.Name, UnitPrice = 100, CostPrice = 50, Quantity = 1 } }
        };
        db.AddRange(productA, productB, orderB);
        await db.SaveChangesAsync();

        StoreAProductId = productA.Id;
        StoreBProductId = productB.Id;
        StoreBCustomerId = customerB.Id;
        StoreBOrderId = orderB.Id;
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _sql.DisposeAsync();
    }

    /// <summary>A client that keeps cookies but does not follow redirects, so tests can assert on them.</summary>
    public HttpClient CreateBrowser() =>
        CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false, HandleCookies = true });

    /// <summary>Adds rows to the test database (each test seeds its own data so tests stay independent).</summary>
    public async Task SeedAsync(params object[] entities)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.AddRange(entities);
        await db.SaveChangesAsync();
    }

    public T Query<T>(Func<AppDbContext, T> query)
    {
        using var scope = Services.CreateScope();
        return query(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }

    private static async Task AddMemberAsync(AppDbContext db, UserManager<ApplicationUser> users, string email, Store store, string role)
    {
        var user = new ApplicationUser { UserName = email, Email = email, OwnerName = email };
        var result = await users.CreateAsync(user, Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        db.StoreMembers.Add(new StoreMember { StoreId = store.Id, UserId = user.Id, Role = role });
        await db.SaveChangesAsync();
    }
}

[CollectionDefinition(Name)]
public class WebAppCollection : ICollectionFixture<SellWiseAppFactory>
{
    public const string Name = "Web app";
}
