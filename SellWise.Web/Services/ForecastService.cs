namespace SellWise.Web.Services;

/// <summary>
/// HTTP client for the Python forecasting service (SellWise.ML). Returns <c>null</c> on any
/// failure so callers can fall back to a simple forecast instead of breaking the dashboard.
/// </summary>
public class ForecastService
{
    private readonly HttpClient _http;
    private readonly ILogger<ForecastService> _logger;

    public ForecastService(HttpClient http, ILogger<ForecastService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<ForecastResponse?> GetForecastAsync(Guid storeId, Guid productId, List<SalesHistoryPoint> history, int periods)
    {
        var request = new ForecastRequest
        {
            store_id = storeId.ToString(),
            product_id = productId.ToString(),
            history = history,
            periods = periods
        };

        try
        {
            var response = await _http.PostAsJsonAsync("api/v1/ml/forecast", request);
            if (response.IsSuccessStatusCode)
                return await response.Content.ReadFromJsonAsync<ForecastResponse>();

            _logger.LogWarning("ML service returned {StatusCode} for product {ProductId}", response.StatusCode, productId);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            _logger.LogWarning(ex, "ML service unavailable for product {ProductId}; using fallback forecast", productId);
        }

        return null;
    }
}

// DTOs mirror SellWise.ML/app/models/schemas.py (snake_case to match the Python API).

public class ForecastRequest
{
    public string store_id { get; set; } = string.Empty;
    public string product_id { get; set; } = string.Empty;
    public List<SalesHistoryPoint> history { get; set; } = new();
    public int periods { get; set; } = 30;
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
