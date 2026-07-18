using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SellWise.Web.Services;

public class ForecastService
{
    private readonly HttpClient _http;
    private readonly string _mlUrl;

    public ForecastService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _mlUrl = config["MlServiceUrl"] ?? "http://localhost:8000";
    }

    public async Task<ForecastResult?> GetForecastAsync(Guid storeId, Guid productId, object historicalData)
    {
        try
        {
            var response = await _http.PostAsJsonAsync($"{_mlUrl}/api/v1/ml/forecast", new 
            {
                store_id = storeId,
                product_id = productId,
                data = historicalData,
                horizon = 30
            });

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<ForecastResult>();
            }
        }
        catch (Exception)
        {
            // In a real app we would log this. Returning null indicates failure.
        }
        return null;
    }
}

public class ForecastResult
{
    public List<string> ds { get; set; } = new List<string>();
    public List<double> yhat { get; set; } = new List<double>();
    public List<double> yhat_lower { get; set; } = new List<double>();
    public List<double> yhat_upper { get; set; } = new List<double>();
}
