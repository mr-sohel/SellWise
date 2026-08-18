using System;
using System.Threading.Tasks;
using SellWise.Web.ViewModels.Customer;

namespace SellWise.Web.Services;

public interface ICustomerService
{
    Task UpdateCustomerAsync(Guid storeId, Guid id, CustomerEditViewModel model);
}