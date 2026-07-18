using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SellWise.Web.Services;

public class ForecastService
{
    private readonly HttpClient _http;
    private readonly string _mlUrl;
    private readonly ILogger<ForecastService> _logger;

    public ForecastService(HttpClient http, IConfiguration config, ILogger<ForecastService> logger)
    {
        _http = http;
        _mlUrl = config["MlServiceUrl"] ?? "http://localhost:8000";
        _logger = logger;
    }

    public async Task<ForecastResponse?> GetForecastAsync(Guid storeId, Guid productId, List<SalesHistoryPoint> history, int periods = 30, string? businessType = null)
    {
        try
        {
            var request = new ForecastRequest
            {
                store_id = storeId.ToString(),
                product_id = productId.ToString(),
                history = history,
                periods = periods,
                business_type = businessType
            };

            var response = await _http.PostAsJsonAsync($"{_mlUrl}/api/v1/ml/forecast", request);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<ForecastResponse>();
            }

            _logger.LogWarning("ML service returned {StatusCode} for product {ProductId}", response.StatusCode, productId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get forecast for product {ProductId} from ML service", productId);
        }
        return null;
    }

    public async Task<bool> IsAvailableAsync()
    {
        try
        {
            var response = await _http.GetAsync($"{_mlUrl}/");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}

// Request/Response DTOs matching the Python ML service schema
public class ForecastRequest
{
    public string store_id { get; set; } = string.Empty;
    public string product_id { get; set; } = string.Empty;
    public List<SalesHistoryPoint> history { get; set; } = new();
    public int periods { get; set; } = 30;
    public string? business_type { get; set; }
}

public class SalesHistoryPoint
{
    public DateTime ds { get; set; }
    public double y { get; set; }
}

public class ForecastResponse
{
    public string store_id { get; set; } = string.Empty;
    public string product_id { get; set; } = string.Empty;
    public List<ForecastResultPoint> forecast { get; set; } = new();
}

public class ForecastResultPoint
{
    public DateTime ds { get; set; }
    public double yhat { get; set; }
    public double yhat_lower { get; set; }
    public double yhat_upper { get; set; }
}
