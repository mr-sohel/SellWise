import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export interface AnalyticsOverview {
  revenue: number;
  orders: number;
  revenueGrowth: number;
  healthScore: number;
  topProducts: any[];
  revenueTrend: any[];
  categoryBreakdown: any[];
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