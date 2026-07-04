import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api/client';
export interface InventoryAlert {
  id: string;
  store_id: string;
  product_id: string;
  product_name: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useAlerts(storeId: string, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ['alerts', storeId, unreadOnly],
    queryFn: async (): Promise<InventoryAlert[]> => {
      const { data } = await api.get(`/stores/${storeId}/alerts`, { params: { unread: unreadOnly } });
      return data.data;
    },
    enabled: !!storeId,
  });
}

export function useMarkAlertAsRead(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/stores/${storeId}/alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', storeId] });
    },
  });
}

export function useMarkAllAlertsAsRead(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch(`/stores/${storeId}/alerts/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', storeId] });
    },
  });
}

export function useTriggerAlerts(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/stores/${storeId}/alerts/generate`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', storeId] });
    },
  });
}
