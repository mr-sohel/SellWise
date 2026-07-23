using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SellWise.Web.Data;
using SellWise.Web.Models;

namespace SellWise.Web.Services;

public class RfmService : IRfmService
{
    private readonly AppDbContext _db;
    private readonly ILogger<RfmService> _logger;

    public RfmService(AppDbContext db, ILogger<RfmService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task RecalculateAllAsync(Guid storeId)
    {
        var customers = await _db.Customers
            .Where(c => c.StoreId == storeId)
            .ToListAsync();

        if (customers.Count == 0) return;

        var now = DateTime.UtcNow;
        var cutoffDate = now.AddDays(-365);

        var customerOrders = await _db.Orders
            .Where(o => o.StoreId == storeId && o.CustomerId.HasValue && o.OrderDate >= cutoffDate)
            .GroupBy(o => o.CustomerId!.Value)
            .Select(g => new
            {
                CustomerId = g.Key,
                LastOrderDate = g.Max(o => o.OrderDate),
                Frequency = g.Count(),
                Monetary = g.Sum(o => o.Total)
            })
            .ToListAsync();

        var orderData = customerOrders.ToDictionary(x => x.CustomerId);

        var allMonetary = customerOrders.Select(x => x.Monetary).OrderBy(x => x).ToList();
        var allFrequency = customerOrders.Select(x => x.Frequency).OrderBy(x => x).ToList();

        foreach (var customer in customers)
        {
            if (orderData.TryGetValue(customer.Id, out var data))
            {
                customer.LastOrderDate = data.LastOrderDate;
                customer.TotalOrders = data.Frequency;
                customer.TotalSpent = data.Monetary;
            }
            else
            {
                customer.LastOrderDate = null;
                customer.TotalOrders = 0;
                customer.TotalSpent = 0;
            }

            var daysSinceLastOrder = customer.LastOrderDate.HasValue
                ? (now - customer.LastOrderDate.Value).Days
                : 999;

            customer.RecencyScore = CalculateRecencyScore(daysSinceLastOrder);
            customer.FrequencyScore = CalculateFrequencyScore(customer.TotalOrders, allFrequency);
            customer.MonetaryScore = CalculateMonetaryScore(customer.TotalSpent, allMonetary);
            customer.RfmSegment = DetermineSegment(customer.RecencyScore, customer.FrequencyScore, customer.MonetaryScore);
            customer.UpdatedAt = now;
        }

        await _db.SaveChangesAsync();
    }

    private static int CalculateRecencyScore(int daysSinceLastOrder)
    {
        return daysSinceLastOrder switch
        {
            <= 30 => 5,
            <= 60 => 4,
            <= 90 => 3,
            <= 180 => 2,
            _ => 1
        };
    }

    private static int CalculateFrequencyScore(int frequency, System.Collections.Generic.List<int> allFrequencies)
    {
        if (allFrequencies.Count == 0) return 1;

        var p25 = GetPercentile(allFrequencies, 25);
        var p50 = GetPercentile(allFrequencies, 50);
        var p75 = GetPercentile(allFrequencies, 75);
        var p90 = GetPercentile(allFrequencies, 90);

        if (frequency >= p90) return 5;
        if (frequency >= p75) return 4;
        if (frequency >= p50) return 3;
        if (frequency >= p25) return 2;
        return 1;
    }

    private static int CalculateMonetaryScore(decimal monetary, System.Collections.Generic.List<decimal> allMonetary)
    {
        if (allMonetary.Count == 0) return 1;

        var p25 = GetPercentile(allMonetary, 25);
        var p50 = GetPercentile(allMonetary, 50);
        var p75 = GetPercentile(allMonetary, 75);
        var p90 = GetPercentile(allMonetary, 90);

        if (monetary >= p90) return 5;
        if (monetary >= p75) return 4;
        if (monetary >= p50) return 3;
        if (monetary >= p25) return 2;
        return 1;
    }

    private static int GetPercentile(System.Collections.Generic.List<int> sortedValues, int percentile)
    {
        if (sortedValues.Count == 0) return 0;
        var index = (percentile / 100.0) * (sortedValues.Count - 1);
        var lower = (int)Math.Floor(index);
        var upper = (int)Math.Ceiling(index);
        if (lower == upper) return sortedValues[lower];
        return (int)(sortedValues[lower] + (index - lower) * (sortedValues[upper] - sortedValues[lower]));
    }

    private static decimal GetPercentile(System.Collections.Generic.List<decimal> sortedValues, int percentile)
    {
        if (sortedValues.Count == 0) return 0;
        var index = (percentile / 100.0) * (sortedValues.Count - 1);
        var lower = (int)Math.Floor(index);
        var upper = (int)Math.Ceiling(index);
        if (lower == upper) return sortedValues[lower];
        return sortedValues[lower] + (decimal)(index - lower) * (sortedValues[upper] - sortedValues[lower]);
    }

    private static string DetermineSegment(int r, int f, int m)
    {
        if (r >= 4 && f >= 4 && m >= 4) return "Champion";
        if (r >= 3 && f >= 3 && m >= 3) return "Loyal";
        if (r >= 4 && f <= 2) return "New Customer";
        if (r >= 3 && f >= 1 && m >= 2) return "Potential Loyalist";
        if (r <= 2 && f >= 3 && m >= 3) return "At Risk";
        if (r <= 2 && f >= 4 && m >= 4) return "Can't Lose Them";
        if (r <= 2 && f <= 2) return "Lost";
        return "Need Attention";
    }
}
