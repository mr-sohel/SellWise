import { forecastRepository, SalesHistory } from '../repositories/forecast.repository';
import { env } from '../config/env';

export class ForecastService {
  async generateForecasts(storeId: string): Promise<{ productsProcessed: number }> {
    const productIds = await forecastRepository.getActiveProductIds(storeId);
    let productsProcessed = 0;

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
          await this.generateProphetForecast(storeId, productId, history);
        }

        productsProcessed++;
      } catch (error) {
        console.error(`[ForecastService] Failed for product ${productId}:`, error);
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

  private async generateProphetForecast(storeId: string, productId: string, history: SalesHistory[]): Promise<void> {
    try {
      const response = await fetch(`${env.ML_SERVICE_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          store_id: storeId,
          history: history.map(h => ({ date: h.date, quantity: h.total_qty })),
        }),
      });

      if (!response.ok) {
        console.error(`[ForecastService] ML service returned ${response.status}, falling back to SMA`);
        await this.generateSMAForecast(storeId, productId, history);
        return;
      }

      const result = await response.json() as { forecasts: Array<{ date: string; predicted: number; lower: number; upper: number }> };

      const forecasts = result.forecasts.map(f => ({
        forecast_date: f.date,
        predicted_qty: Math.max(0, f.predicted),
        lower_bound: Math.max(0, f.lower),
        upper_bound: f.upper,
        model_used: 'prophet',
      }));

      await forecastRepository.upsertForecasts(storeId, productId, forecasts);
    } catch (error) {
      console.error(`[ForecastService] ML service call failed, falling back to SMA:`, error);
      await this.generateSMAForecast(storeId, productId, history);
    }
  }

  async getForecasts(storeId: string, productId: string) {
    return forecastRepository.findByProduct(storeId, productId);
  }
}

export const forecastService = new ForecastService();
