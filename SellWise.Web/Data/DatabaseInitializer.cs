using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Authorization;
using SellWise.Web.Models;

namespace SellWise.Web.Data;

/// <summary>
/// Runs at startup: waits for SQL Server, applies migrations and (optionally) creates the
/// demo account with two seeded stores.
/// </summary>
public static class DatabaseInitializer
{
    private const int MaxAttempts = 10;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(3);

    public static async Task InitializeAsync(IServiceProvider services, DemoDataOptions demo)
    {
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DatabaseInitializer));
        var db = services.GetRequiredService<AppDbContext>();

        // SQL Server in Docker can take a while to accept connections, so retry *connecting*.
        // Migration errors are not retried: they won't fix themselves.
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await EnsureDatabaseExistsAsync(db.Database.GetConnectionString()!);
                break;
            }
            catch (SqlException ex) when (attempt < MaxAttempts)
            {
                logger.LogWarning("SQL Server not reachable yet (attempt {Attempt}/{Max}): {Message}", attempt, MaxAttempts, ex.Message);
                await Task.Delay(RetryDelay);
            }
        }

        try
        {
            await db.Database.MigrateAsync();
        }
        catch (SqlException ex)
        {
            logger.LogCritical(ex,
                "Applying migrations failed. If the database was created from different migrations " +
                "(e.g. 'There is already an object named ...'), reset it with scripts/reset-db.ps1 / scripts/reset-db.sh.");
            throw;
        }

        if (demo.Enabled)
            await SeedDemoAccountAsync(services, demo, logger);
    }

    /// <summary>Creates the database through 'master' if it doesn't exist yet.</summary>
    private static async Task EnsureDatabaseExistsAsync(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = builder.InitialCatalog;
        builder.InitialCatalog = "master";

        await using var connection = new SqlConnection(builder.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            IF DB_ID(@name) IS NULL
            BEGIN
                DECLARE @sql nvarchar(300) = N'CREATE DATABASE ' + QUOTENAME(@name);
                EXEC (@sql);
            END
            """;
        command.Parameters.AddWithValue("@name", databaseName);
        await command.ExecuteNonQueryAsync();
    }

    private static async Task SeedDemoAccountAsync(IServiceProvider services, DemoDataOptions demo, ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(demo.AdminPassword))
        {
            logger.LogWarning("DemoData is enabled but DemoData:AdminPassword is not set; skipping demo seed.");
            return;
        }

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        if (await userManager.FindByEmailAsync(demo.AdminEmail) != null)
            return;

        var admin = new ApplicationUser { UserName = demo.AdminEmail, Email = demo.AdminEmail, OwnerName = "Demo Owner" };
        var result = await userManager.CreateAsync(admin, demo.AdminPassword);
        if (!result.Succeeded)
        {
            logger.LogError("Could not create demo user: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }

        var db = services.GetRequiredService<AppDbContext>();
        var seeder = services.GetRequiredService<DemoSeederService>();

        var techStore = await CreateOwnedStoreAsync(db, admin.Id, "SellWise Tech BD");
        await seeder.SeedStoreAsync(techStore.Id, randomSeed: 42);

        var fashionStore = await CreateOwnedStoreAsync(db, admin.Id, "StyleHub BD");
        await seeder.SeedSecondStoreAsync(fashionStore.Id, randomSeed: 99);

        logger.LogInformation("Seeded demo account {Email} with two stores", demo.AdminEmail);
    }

    private static async Task<Store> CreateOwnedStoreAsync(AppDbContext db, string userId, string name)
    {
        var store = new Store { Name = name };
        db.Stores.Add(store);
        db.StoreMembers.Add(new StoreMember { StoreId = store.Id, UserId = userId, Role = StoreRoles.Owner });
        await db.SaveChangesAsync();
        return store;
    }
}

/// <summary>Bound from the "DemoData" configuration section.</summary>
public class DemoDataOptions
{
    public bool Enabled { get; set; }
    public string AdminEmail { get; set; } = "admin@sellwise.com";
    public string? AdminPassword { get; set; }
}
