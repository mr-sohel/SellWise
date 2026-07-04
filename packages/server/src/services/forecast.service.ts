import { forecastRepository, SalesHistory } from '../repositories/forecast.repository';
import { storeRepository } from '../repositories/store.repository';
import { env } from '../config/env';
import logger from '../utils/logger';

export class ForecastService {
  async generateForecasts(storeId: string): Promise<{ productsProcessed: number }> {
    const productIds = await forecastRepository.getActiveProductIds(storeId);
    let productsProcessed = 0;

    // Fetch store's business_type for ML seasonality tuning
    const store = await storeRepository.findById(storeId);
    const businessType = store?.business_type || null;

    for (const productId of productIds) {
      try {
        const history = await forecastRepository.getSalesHistory(storeId, productId, 90);

        if (history.length < 7) {
          continue; // Not enough data for any forecast
        }

        if (history.length < 30) {
          // Tier 1: Simple Moving Average (SMA)
          await this.generateSMAForecast(storeId, productId, history);
        } else {
          // Tier 2: Call Python ML service for Prophet
          await this.generateProphetForecast(storeId, productId, history, businessType);
        }

        productsProcessed++;
      } catch (error) {
        logger.error(`[ForecastService] Failed for product ${productId}:`, error);
      }
    }

    return { productsProcessed };
  }

  private async generateSMAForecast(storeId: string, productId: string, history: SalesHistory[]): Promise<void> {
    const windowSize = 7;
    const forecastDays = 30;
    const values = history.map(h => h.total_qty);

    // Calculate SMA
    const sma = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;

    // Calculate standard deviation for bounds
    const variance = values.slice(-windowSize).reduce((sum, v) => sum + Math.pow(v - sma, 2), 0) / windowSize;
    const stdDev = Math.sqrt(variance);

    const forecasts = [];
    const lastDate = new Date(history[history.length - 1].date);

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      forecasts.push({
        forecast_date: forecastDate.toISOString().split('T')[0],
        predicted_qty: Math.max(0, Math.round(sma * 100) / 100),
        lower_bound: Math.max(0, Math.round((sma - 1.96 * stdDev) * 100) / 100),
        upper_bound: Math.round((sma + 1.96 * stdDev) * 100) / 100,
        model_used: 'sma',
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
        logger.error(`[ForecastService] ML service returned ${response.status}, falling back to SMA`);
        await this.generateSMAForecast(storeId, productId, history);
        return;
      }

      const result = await response.json() as { forecast: Array<{ ds: string; yhat: number; yhat_lower: number; yhat_upper: number }> };

      const forecasts = result.forecast.map(f => ({
        forecast_date: f.ds,
        predicted_qty: Math.max(0, f.yhat),
        lower_bound: Math.max(0, f.yhat_lower),
        upper_bound: f.yhat_upper,
        model_used: 'prophet',
      }));

      await forecastRepository.upsertForecasts(storeId, productId, forecasts);
    } catch (error) {
      logger.error(`[ForecastService] ML service call failed, falling back to SMA:`, error);
      await this.generateSMAForecast(storeId, productId, history);
    }
  }

  async getForecasts(storeId: string, productId: string) {
    return forecastRepository.findByProduct(storeId, productId);
  }
}

export const forecastService = new ForecastService();
