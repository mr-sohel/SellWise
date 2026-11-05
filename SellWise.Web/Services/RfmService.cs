using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;

namespace SellWise.Web.Services;

/// <summary>Recalculates every customer's RFM scores and segment from their order history.</summary>
public class RfmService : IRfmService
{
    private readonly AppDbContext _db;

    public RfmService(AppDbContext db)
    {
        _db = db;
    }

    public async Task RecalculateAllAsync(Guid storeId)
    {
        var customers = await _db.Customers.Where(c => c.StoreId == storeId).ToListAsync();
        if (customers.Count == 0) return;

        // Only real sales count: cancelled and returned orders are excluded.
        var stats = await _db.Orders
            .Where(o => o.StoreId == storeId && o.CustomerId != null
                && o.Status != "cancelled" && o.Status != "returned")
            .GroupBy(o => o.CustomerId!.Value)
            .Select(g => new
            {
                CustomerId = g.Key,
                LastOrderDate = g.Max(o => o.OrderDate),
                Orders = g.Count(),
                Spent = g.Sum(o => o.Total)
            })
            .ToDictionaryAsync(x => x.CustomerId);

        var sortedFrequency = stats.Values.Select(s => (decimal)s.Orders).Order().ToList();
        var sortedMonetary = stats.Values.Select(s => s.Spent).Order().ToList();
        var now = DateTime.UtcNow;

        foreach (var customer in customers)
        {
            stats.TryGetValue(customer.Id, out var s);
            customer.LastOrderDate = s?.LastOrderDate;
            customer.TotalOrders = s?.Orders ?? 0;
            customer.TotalSpent = s?.Spent ?? 0;

            var daysSinceLastOrder = s == null ? int.MaxValue : (now - s.LastOrderDate).Days;
            customer.RecencyScore = RfmScoring.RecencyScore(daysSinceLastOrder);
            customer.FrequencyScore = RfmScoring.PercentileScore(customer.TotalOrders, sortedFrequency);
            customer.MonetaryScore = RfmScoring.PercentileScore(customer.TotalSpent, sortedMonetary);
            customer.RfmSegment = RfmScoring.Segment(customer.RecencyScore, customer.FrequencyScore, customer.MonetaryScore);
            customer.UpdatedAt = now;
        }

        await _db.SaveChangesAsync();
    }
}
