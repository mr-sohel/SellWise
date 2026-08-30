using System;
using System.Threading.Tasks;
using SellWise.Web.ViewModels.Customer;

using SellWise.Web.Models;

namespace SellWise.Web.Services;

public interface ICustomerService
{
    Task<Customer> CreateCustomerAsync(Guid storeId, CustomerCreateViewModel model);
    Task UpdateCustomerAsync(Guid storeId, Guid id, CustomerEditViewModel model);
}