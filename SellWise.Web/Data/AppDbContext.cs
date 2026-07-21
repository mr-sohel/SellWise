using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Models;

namespace SellWise.Web.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Store> Stores => Set<Store>();
    public DbSet<StoreMember> StoreMembers => Set<StoreMember>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<InventoryAlert> Alerts => Set<InventoryAlert>();
    public DbSet<Forecast> Forecasts => Set<Forecast>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<StoreMember>()
            .HasKey(sm => new { sm.StoreId, sm.UserId });
            
        builder.Entity<StoreMember>()
            .HasOne(sm => sm.Store)
            .WithMany(s => s.Members)
            .HasForeignKey(sm => sm.StoreId);

        builder.Entity<StoreMember>()
            .HasOne(sm => sm.User)
            .WithMany(u => u.StoreMembers)
            .HasForeignKey(sm => sm.UserId);
            
        // Configure decimal precision to avoid warnings
        builder.Entity<Product>().Property(p => p.CostPrice).HasPrecision(18, 2);
        builder.Entity<Product>().Property(p => p.SellingPrice).HasPrecision(18, 2);
        
        builder.Entity<Order>().Property(o => o.Total).HasPrecision(18, 2);
        builder.Entity<Order>().Property(o => o.DeliveryCharge).HasPrecision(18, 2);
        builder.Entity<Order>().Property(o => o.Discount).HasPrecision(18, 2);
        
        builder.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasPrecision(18, 2);
        builder.Entity<OrderItem>().Property(oi => oi.CostPrice).HasPrecision(18, 2);
        
        builder.Entity<Customer>().Property(c => c.TotalSpent).HasPrecision(18, 2);
        
        builder.Entity<Expense>().Property(e => e.Amount).HasPrecision(18, 2);
        
        // Prevent multiple cascade paths
        builder.Entity<InventoryAlert>()
            .HasOne(a => a.Store)
            .WithMany()
            .HasForeignKey(a => a.StoreId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.Entity<Forecast>()
            .HasOne(f => f.Store)
            .WithMany()
            .HasForeignKey(f => f.StoreId)
            .OnDelete(DeleteBehavior.Restrict);

        // Multi-tenancy performance indexes
        builder.Entity<Product>().HasIndex(p => new { p.StoreId, p.IsActive });
        builder.Entity<Order>().HasIndex(o => new { o.StoreId, o.OrderDate });
        builder.Entity<Customer>().HasIndex(c => c.StoreId);
        builder.Entity<Expense>().HasIndex(e => new { e.StoreId, e.ExpenseDate });
        builder.Entity<InventoryAlert>().HasIndex(a => new { a.StoreId, a.IsRead });
        builder.Entity<Forecast>().HasIndex(f => f.StoreId);
    }
}
