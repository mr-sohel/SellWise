using SellWise.Web.Models;
using SellWise.Web.ViewModels.Customer;

namespace SellWise.Web.Services;

public interface ICustomerService
{
    Task<Customer> CreateCustomerAsync(Guid storeId, CustomerCreateViewModel model);

    /// <returns><c>false</c> if the customer does not exist in this store.</returns>
    Task<bool> UpdateCustomerAsync(Guid storeId, Guid id, CustomerEditViewModel model);
}
