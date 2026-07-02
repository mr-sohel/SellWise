import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerFiltersDTO, PaginatedResult } from '@sellwise/shared';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export function useCustomers(storeId: string, filters: CustomerFiltersDTO) {
  return useQuery({
    queryKey: ['customers', storeId, filters],
    queryFn: async (): Promise<PaginatedResult<Customer>> => {
      const { data } = await api.get(`/stores/${storeId}/customers`, { params: filters });
      return { data: data.data, meta: data.meta };
    },
    enabled: !!storeId,
  });
}

export function useCreateCustomer(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerData: CreateCustomerDTO) => {
      const { data } = await api.post(`/stores/${storeId}/customers`, customerData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
    },
  });
}

export function useUpdateCustomer(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerDTO }) => {
      const response = await api.put(`/stores/${storeId}/customers/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', storeId] });
    },
  });
}