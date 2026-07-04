import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api/client';

export interface AnalyticsOverview {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  healthScore: number;
  topProducts: any[];
  worstProducts: any[];
  revenueTrend: any[];
  categoryBreakdown: any[];
  inventoryStatus: {
    totalValue: number;
    turnoverRate: number;
  };
  customerInsights: {
    totalCustomers: number;
    retainedCustomers: number;
    retentionRate: number;
  };
}

export function useDashboard(storeId: string, range: string) {
  return useQuery({
    queryKey: ['analytics', 'overview', storeId, range],
    queryFn: async (): Promise<AnalyticsOverview> => {
      const { data } = await api.get(`/stores/${storeId}/analytics/overview`, { params: { range } });
      return data.data;
    },
    enabled: !!storeId,
  });
}

export interface DemandForecastItem {
  product_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  forecasts: Array<{
    forecast_date: string;
    predicted_qty: number;
    lower_bound: number;
    upper_bound: number;
    model_used: string;
  }>;
}

export function useDemandForecast(storeId: string, limit: number = 5, days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'demand-forecast', storeId, limit, days],
    queryFn: async (): Promise<DemandForecastItem[]> => {
      const { data } = await api.get(`/stores/${storeId}/analytics/demand-forecast`, { params: { limit, days } });
      return data.data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}
