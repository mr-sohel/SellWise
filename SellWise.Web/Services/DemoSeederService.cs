using SellWise.Web.Data;
using SellWise.Web.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SellWise.Web.Services;

public class DemoSeederService
{
    private readonly AppDbContext _db;

    public DemoSeederService(AppDbContext db)
    {
        _db = db;
    }

    public async Task SeedStoreAsync(Guid storeId)
    {
        if (_db.Products.Any(p => p.StoreId == storeId))
            return; // Already seeded

        var store = await _db.Stores.FindAsync(storeId);
        if (store == null) return;

        // 1. Categories
        var catElectronics = new Category { StoreId = storeId, Name = "Electronics", IsDefault = true, SortOrder = 1 };
        var catClothing = new Category { StoreId = storeId, Name = "Clothing", IsDefault = false, SortOrder = 2 };
        _db.Categories.AddRange(catElectronics, catClothing);

        // 2. Customers
        var c1 = new Customer { StoreId = storeId, Name = "John Doe", Phone = "01700000001", Email = "john@example.com" };
        var c2 = new Customer { StoreId = storeId, Name = "Jane Smith", Phone = "01700000002", Email = "jane@example.com" };
        var c3 = new Customer { StoreId = storeId, Name = "Robert Fox", Phone = "01700000003", Email = "robert@example.com" };
        _db.Customers.AddRange(c1, c2, c3);

        // 3. Products
        var p1 = new Product { StoreId = storeId, Name = "Wireless Mouse", CostPrice = 500, SellingPrice = 850, StockQuantity = 100, LowStockThreshold = 10, Unit = "pcs", Category = "Electronics", IsActive = true };
        var p2 = new Product { StoreId = storeId, Name = "Mechanical Keyboard", CostPrice = 1200, SellingPrice = 2500, StockQuantity = 50, LowStockThreshold = 5, Unit = "pcs", Category = "Electronics", IsActive = true };
        var p3 = new Product { StoreId = storeId, Name = "Cotton T-Shirt", CostPrice = 250, SellingPrice = 600, StockQuantity = 200, LowStockThreshold = 20, Unit = "pcs", Category = "Clothing", IsActive = true };
        var p4 = new Product { StoreId = storeId, Name = "Smart Watch", CostPrice = 1500, SellingPrice = 3200, StockQuantity = 15, LowStockThreshold = 5, Unit = "pcs", Category = "Electronics", IsActive = true };
        _db.Products.AddRange(p1, p2, p3, p4);

        await _db.SaveChangesAsync();

        // 4. Orders (Generate 30 days of history for the Chart)
        var rnd = new Random(42); 
        for (int i = 0; i < 60; i++)
        {
            var date = DateTime.UtcNow.AddDays(-rnd.Next(1, 30));
            var product = i % 4 == 0 ? p4 : (i % 3 == 0 ? p3 : (i % 2 == 0 ? p2 : p1));
            var qty = rnd.Next(1, 4);
            
            var order = new Order
            {
                StoreId = storeId,
                CustomerId = i % 3 == 0 ? c3.Id : (i % 2 == 0 ? c1.Id : c2.Id),
                OrderNumber = $"ORD-{1000 + i}",
                Status = "completed",
                Source = i % 5 == 0 ? "online" : "walk_in",
                Total = product.SellingPrice * qty,
                DeliveryCharge = i % 5 == 0 ? 60 : 0,
                Discount = 0,
                OrderDate = date,
                CreatedAt = date,
                UpdatedAt = date
            };
            
            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.SellingPrice,
                CostPrice = product.CostPrice,
                Quantity = qty,
                CreatedAt = date
            });

            _db.Orders.Add(order);
            
            // Update customer totals
            var customer = _db.Customers.Local.FirstOrDefault(c => c.Id == order.CustomerId);
            if (customer != null)
            {
                customer.TotalOrders++;
                customer.TotalSpent += order.Total;
            }
        }

        await _db.SaveChangesAsync();
    }
}
