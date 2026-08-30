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

    public async Task UpdateCustomerAsync(Guid storeId, Guid id, CustomerEditViewModel model)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.StoreId == storeId);
        if (customer == null) throw new InvalidOperationException("Customer not found.");

        customer.Name = model.Name;
        customer.Phone = model.Phone;
        customer.Email = model.Email;
        customer.Address = model.Address;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }
}