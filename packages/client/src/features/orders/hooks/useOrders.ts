import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Order, CreateOrderDTO, UpdateOrderStatusDTO, OrderFiltersDTO, PaginatedResult } from '@sellwise/shared';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export function useOrders(storeId: string, filters: OrderFiltersDTO) {
  return useQuery({
    queryKey: ['orders', storeId, filters],
    queryFn: async (): Promise<PaginatedResult<Order>> => {
      const { data } = await api.get(`/stores/${storeId}/orders`, { params: filters });
      return { data: data.data, meta: data.meta };
    },
    enabled: !!storeId,
  });
}

export function useCreateOrder(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: CreateOrderDTO) => {
      const { data } = await api.post(`/stores/${storeId}/orders`, orderData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] });
      queryClient.invalidateQueries({ queryKey: ['products', storeId] }); // Stock changed
    },
  });
}

export function useUpdateOrderStatus(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderStatusDTO }) => {
      const response = await api.patch(`/stores/${storeId}/orders/${id}/status`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] });
    },
  });
}