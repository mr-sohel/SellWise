using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Customer;

namespace SellWise.Web.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;

    public CustomerService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Customer> CreateCustomerAsync(Guid storeId, CustomerCreateViewModel model)
    {
        var customer = new Customer
        {
            StoreId = storeId,
            Name = model.Name.Trim(),
            Phone = model.Phone?.Trim(),
            Email = model.Email?.Trim(),
            Address = model.Address?.Trim(),
            TotalOrders = 0,
            TotalSpent = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        return customer;
    }

    public async Task<bool> UpdateCustomerAsync(Guid storeId, Guid id, CustomerEditViewModel model)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.StoreId == storeId);
        if (customer == null) return false;

        customer.Name = model.Name.Trim();
        customer.Phone = model.Phone?.Trim();
        customer.Email = model.Email?.Trim();
        customer.Address = model.Address?.Trim();
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }
}