import { analyticsRepository, DateRange } from '../repositories/analytics.repository';
import { redis } from '../config/redis';

export interface AnalyticsOverview {
  revenue: number;
  orders: number;
  revenueGrowth: number;
  healthScore: number;
  topProducts: any[];
  revenueTrend: any[];
  categoryBreakdown: any[];
}

export class AnalyticsService {
  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  async getOverview(storeId: string, range: string): Promise<AnalyticsOverview> {
    const cacheKey = `analytics:overview:${storeId}:${range}`;

    // 1. Try to get from Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as AnalyticsOverview;
    }

    // 2. Determine DateRange based on 'range' parameter
    const endDate = new Date();
    const startDate = new Date();
    let days = 30; // default

    if (range === '7d') days = 7;
    else if (range === '30d') days = 30;
    else if (range === '90d') days = 90;
    else if (range === '1y') days = 365;

    startDate.setDate(endDate.getDate() - days);

    const currentRange: DateRange = { startDate, endDate };

    // Previous period for growth calculation
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevEndDate.getDate() - days);
    const previousRange: DateRange = { startDate: prevStartDate, endDate: prevEndDate };

    // 3. Fetch Data in Parallel
    const [
      currentMetrics,
      prevMetrics,
      topProducts,
      revenueTrend,
      categoryBreakdown,
      inventoryValue,
      cogs,
      fulfillment
    ] = await Promise.all([
      analyticsRepository.getRevenueMetrics(storeId, currentRange),
      analyticsRepository.getRevenueMetrics(storeId, previousRange),
      analyticsRepository.getTopProducts(storeId, currentRange),
      analyticsRepository.getRevenueTrend(storeId, currentRange),
      analyticsRepository.getCategoryBreakdown(storeId, currentRange),
      analyticsRepository.getInventoryValue(storeId),
      analyticsRepository.getCOGS(storeId, currentRange),
      analyticsRepository.getFulfillmentMetrics(storeId, currentRange)
    ]);

    // 4. Calculate Health Score
    // Revenue Growth (40%)
    let revenueGrowth = 0;
    if (prevMetrics.revenue > 0) {
      revenueGrowth = ((currentMetrics.revenue - prevMetrics.revenue) / prevMetrics.revenue) * 100;
    } else if (currentMetrics.revenue > 0) {
      revenueGrowth = 100;
    }
    const growthNorm = Math.min(Math.max(revenueGrowth / 100, 0), 1) * 100; // Normalize 0-100

    // Inventory Turnover (30%)
    // Turnover = COGS / Avg Inventory Value (Simplified to current value here)
    let turnoverRate = 0;
    if (inventoryValue > 0) {
      turnoverRate = cogs / inventoryValue;
    }
    // Assume a turnover of 4+ over the period is excellent (100 score)
    const turnoverNorm = Math.min((turnoverRate / 4) * 100, 100);

    // Fulfillment Rate (30%)
    let fulfillmentRate = 100;
    if (fulfillment.nonFailed > 0) {
      fulfillmentRate = (fulfillment.delivered / fulfillment.nonFailed) * 100;
    }
    const fulfillmentNorm = Math.min(Math.max(fulfillmentRate, 0), 100);

    const healthScore = Math.round(
      (growthNorm * 0.4) + (turnoverNorm * 0.3) + (fulfillmentNorm * 0.3)
    );

    // 5. Construct Final Object
    const overview: AnalyticsOverview = {
      revenue: currentMetrics.revenue,
      orders: currentMetrics.orders,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      healthScore,
      topProducts,
      revenueTrend,
      categoryBreakdown
    };

    // 6. Cache and Return
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(overview));

    return overview;
  }
}

export const analyticsService = new AnalyticsService();