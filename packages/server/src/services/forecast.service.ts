import { forecastRepository, SalesHistory } from '../repositories/forecast.repository';
import { storeRepository } from '../repositories/store.repository';
import { env } from '../config/env';
import logger from '../utils/logger';

/**
 * Forecast service with two-tier approach:
 * - Tier 1: Exponential Weighted Moving Average (EWMA) for < 30 days of data
 * - Tier 2: Facebook Prophet for >= 30 days (via Python ML service)
 *
 * EWMA is preferred over SMA because it weights recent observations more heavily,
 * making it more responsive to trend changes while still smoothing noise.
 */
export class ForecastService {
  async generateForecasts(storeId: string): Promise<{ productsProcessed: number; accuracy?: number }> {
    const productIds = await forecastRepository.getActiveProductIds(storeId);
    let productsProcessed = 0;

    // Fetch store's business_type for ML seasonality tuning
    const store = await storeRepository.findById(storeId);
    const businessType = store?.business_type || null;

    for (const productId of productIds) {
      try {
        const rawHistory = await forecastRepository.getSalesHistory(storeId, productId, 365);

        if (rawHistory.length < 7) {
          continue; // Not enough data for any forecast
        }

        // Fill missing days with 0 sales — but cap at 180 days to avoid
        // extreme zero-inflation for products sold long ago with sporadic orders
        const history: SalesHistory[] = this.fillMissingDays(rawHistory, 180);

        if (history.length < 7) {
          continue; // Not enough data for any forecast
        }

        if (history.length < 30) {
          // Tier 1: Exponential Weighted Moving Average
          await this.generateEWMAForecast(storeId, productId, history);
        } else {
          // Tier 2: Call Python ML service for Prophet
          await this.generateProphetForecast(storeId, productId, history, businessType);
        }

        productsProcessed++;
      } catch (error) {
        logger.error(`[ForecastService] Failed for product ${productId}:`, error);
      }
    }

    // Calculate accuracy of past forecasts vs actuals
    const accuracy = await this.calculateAccuracy(storeId);

    return { productsProcessed, accuracy };
  }

  /**
   * Fill missing days in sales history with zeros.
   * Caps the maximum history length to prevent zero-inflation for sporadic products.
   */
  private fillMissingDays(rawHistory: SalesHistory[], maxDays: number = 180): SalesHistory[] {
    const historyMap = new Map<string, number>();
    for (const h of rawHistory) {
      const d = new Date(h.date);
      historyMap.set(d.toISOString().split('T')[0], Number(h.total_qty));
    }

    // Start from the most recent of: first sale date or maxDays ago
    const firstDate = new Date(rawHistory[0].date);
    firstDate.setUTCHours(0, 0, 0, 0);

    const cutoffDate = new Date(firstDate);
    cutoffDate.setDate(cutoffDate.getDate() + maxDays);

    const startDate = cutoffDate > new Date() ? firstDate : cutoffDate;
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);

    const history: SalesHistory[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      history.push({
        date: dateStr,
        total_qty: historyMap.get(dateStr) || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return history;
  }

  /**
   * Exponential Weighted Moving Average (EWMA) forecast.
   *
   * Unlike SMA which treats all window observations equally, EWMA applies
   * exponential decay weights so recent observations matter more.
   * Alpha (smoothing factor) is auto-selected based on data characteristics:
   * - High variance → lower alpha (more smoothing)
   * - Low variance → higher alpha (more responsive)
   */
  private async generateEWMAForecast(storeId: string, productId: string, history: SalesHistory[]): Promise<void> {
    const forecastDays = 30;
    const values = history.map(h => Number(h.total_qty));

    // Use last 14 days as EWMA window (or all data if < 14)
    const windowSize = Math.min(14, values.length);
    const window = values.slice(-windowSize);

    // Auto-select alpha based on coefficient of variation
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / window.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;

    // High variation → smooth more (lower alpha); Low variation → track closely (higher alpha)
    const alpha = cv > 1.0 ? 0.2 : cv > 0.5 ? 0.3 : 0.5;

    // Calculate EWMA
    let ewma = window[0];
    for (let i = 1; i < window.length; i++) {
      ewma = alpha * window[i] + (1 - alpha) * ewma;
    }

    // Calculate prediction interval based on residual standard error
    const residuals = window.map(v => v - ewma);
    const sse = residuals.reduce((sum, r) => sum + r * r, 0);
    const stdErr = Math.sqrt(sse / Math.max(window.length - 1, 1));

    const forecasts = [];
    const lastDate = new Date(history[history.length - 1].date);

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      // Widen interval for further-out forecasts (uncertainty grows with horizon)
      const horizonFactor = 1 + (i / forecastDays) * 0.5;
      const bound = 1.96 * stdErr * horizonFactor;

      forecasts.push({
        forecast_date: forecastDate.toISOString().split('T')[0],
        predicted_qty: Math.max(0, Math.round(ewma * 100) / 100),
        lower_bound: Math.max(0, Math.round((ewma - bound) * 100) / 100),
        upper_bound: Math.round((ewma + bound) * 100) / 100,
        model_used: 'ewma',
      });
    }

    await forecastRepository.upsertForecasts(storeId, productId, forecasts);
  }

  private async generateProphetForecast(storeId: string, productId: string, history: SalesHistory[], businessType: string | null): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${env.ML_SERVICE_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          product_id: productId,
          history: history.map(h => ({ ds: h.date, y: h.total_qty })),
          periods: 30,
          business_type: businessType,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        logger.error(`[ForecastService] ML service returned ${response.status}, falling back to EWMA`);
        await this.generateEWMAForecast(storeId, productId, history);
        return;
      }

      const result = await response.json() as { forecast: Array<{ ds: string; yhat: number; yhat_lower: number; yhat_upper: number }> };

      // Temporary debug log for Apple Watch
      if (productId === '5140d39f-cc76-43e5-8f65-2dcde6876c12' || history[history.length - 1].total_qty > 1000) {
        logger.info(`[ForecastService] Received from ML for viral product: ${JSON.stringify(result.forecast.slice(0, 2))}`);
      }

      const forecasts = result.forecast.map(f => ({
        forecast_date: f.ds,
        predicted_qty: Math.max(0, f.yhat),
        lower_bound: Math.max(0, f.yhat_lower),
        upper_bound: f.yhat_upper,
        model_used: 'prophet',
      }));

      await forecastRepository.upsertForecasts(storeId, productId, forecasts);
    } catch (error) {
      logger.error(`[ForecastService] ML service call failed, falling back to EWMA:`, error);
      await this.generateEWMAForecast(storeId, productId, history);
    }
  }

  private async calculateAccuracy(storeId: string): Promise<number | undefined> {
    try {
      const { rows } = await this.query(
        `SELECT f.product_id, f.predicted_qty, SUM(oi.quantity) as actual_qty
         FROM forecasts f
         LEFT JOIN order_items oi ON oi.product_id = f.product_id
         LEFT JOIN orders o ON oi.order_id = o.id
           AND o.status NOT IN ('cancelled', 'returned')
           AND DATE(o.order_date) = f.forecast_date
         WHERE f.store_id = $1
           AND f.forecast_date >= CURRENT_DATE - INTERVAL '30 days'
           AND f.forecast_date < CURRENT_DATE - INTERVAL '3 days'
           AND f.model_used IN ('ewma', 'prophet')
         GROUP BY f.product_id, f.id, f.predicted_qty
         HAVING SUM(oi.quantity) IS NOT NULL AND SUM(oi.quantity) > 0`,
        [storeId]
      );

      if (rows.length === 0) return undefined;

      const productMapes = new Map<string, { totalMape: number; count: number }>();

      rows.forEach((r: any) => {
        const productId = r.product_id;
        const actual = Number(r.actual_qty);
        const predicted = Number(r.predicted_qty);
        const mape = Math.abs(actual - predicted) / actual;
        
        const existing = productMapes.get(productId) || { totalMape: 0, count: 0 };
        existing.totalMape += mape;
        existing.count += 1;
        productMapes.set(productId, existing);
      });

      let overallMapeSum = 0;
      let overallCount = 0;

      // Update products table with per-product MAPE
      for (const [productId, data] of productMapes.entries()) {
        const productMape = Math.round((data.totalMape / data.count) * 10000) / 100;
        await this.query(
          `UPDATE products SET forecast_mape = $1 WHERE id = $2 AND store_id = $3`,
          [productMape, productId, storeId]
        );
        overallMapeSum += data.totalMape;
        overallCount += data.count;
      }

      return Math.round((overallMapeSum / overallCount) * 10000) / 100;
    } catch (error) {
      logger.error('[ForecastService] Failed to calculate accuracy:', error);
      return undefined;
    }
  }

  private async query(text: string, params?: any[]) {
    const { db } = await import('../config/db');
    return db.query(text, params);
  }

  async getForecasts(storeId: string, productId: string) {
    return forecastRepository.findByProduct(storeId, productId);
  }

  async getDemandForecast(storeId: string, limit: number = 5, days: number = 30) {
    return forecastRepository.findTopProductsForecasts(storeId, limit, days);
  }
}

export const forecastService = new ForecastService();
