using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using SellWise.Web.ViewModels.Product;

namespace SellWise.Web.Services;

public interface IProductService
{
    Task CreateProductAsync(Guid storeId, ProductFormViewModel model);
    Task UpdateProductAsync(Guid storeId, Guid id, ProductFormViewModel model);
    Task DeleteProductAsync(Guid storeId, Guid id);
    Task<(int Count, string? Error)> BulkImportAsync(Guid storeId, IFormFile file);
}