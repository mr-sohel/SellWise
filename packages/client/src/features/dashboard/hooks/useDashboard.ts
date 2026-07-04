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
