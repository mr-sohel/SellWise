using System;
using System.Threading.Tasks;
using SellWise.Web.ViewModels.Order;

namespace SellWise.Web.Services;

public interface IOrderService
{
    Task<string?> CreateOrderAsync(Guid storeId, OrderFormViewModel model);
    Task<string?> ChangeOrderStatusAsync(Guid orderId, Guid storeId, string newStatus);
    Task<(decimal TodayRevenue, int TodayOrdersCount, int PendingOrdersCount)> GetDashboardKpisAsync(Guid storeId);
}
