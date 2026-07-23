using System;
using System.Threading.Tasks;

namespace SellWise.Web.Services;

public interface IRfmService
{
    Task RecalculateAllAsync(Guid storeId);
}
