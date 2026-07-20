using System;
using System.Threading.Tasks;

namespace SellWise.Web.Services;

public interface IAlertService
{
    Task ScanAndGenerateAlertsAsync(Guid storeId);
}
