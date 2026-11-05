using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Tests;

/// <summary>
/// A throwaway in-memory SQLite database. Unlike the EF in-memory provider, SQLite supports
/// real transactions and ExecuteUpdate, which the order logic relies on.
/// </summary>
public sealed class TestDb : IDisposable
{
    private readonly SqliteConnection _connection;

    public TestDb()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        using var db = CreateContext();
        db.Database.EnsureCreated();
    }

    public AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);

    public Store AddStore(string name = "Test Store")
    {
        using var db = CreateContext();
        var store = new Store { Name = name };
        db.Stores.Add(store);
        db.SaveChanges();
        return store;
    }

    public Product AddProduct(Guid storeId, int stock, decimal price = 100m, string name = "Widget")
    {
        using var db = CreateContext();
        var product = new Product { StoreId = storeId, Name = name, SellingPrice = price, CostPrice = price / 2, StockQuantity = stock };
        db.Products.Add(product);
        db.SaveChanges();
        return product;
    }

    public Customer AddCustomer(Guid storeId, string name = "Rahim")
    {
        using var db = CreateContext();
        var customer = new Customer { StoreId = storeId, Name = name };
        db.Customers.Add(customer);
        db.SaveChanges();
        return customer;
    }

    public int StockOf(Guid productId)
    {
        using var db = CreateContext();
        return db.Products.Single(p => p.Id == productId).StockQuantity;
    }

    public void Dispose() => _connection.Dispose();
}
