using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Customer;

namespace SellWise.Web.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _db;

    public CustomerService(AppDbContext db)
    {
        _db = db;
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