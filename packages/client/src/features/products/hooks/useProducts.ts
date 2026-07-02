import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Product, CreateProductDTO, UpdateProductDTO, ProductFiltersDTO, PaginatedResult } from '@sellwise/shared';

// Ideally, this axios instance would be centralized in `api/client.ts`
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export function useProducts(storeId: string, filters: ProductFiltersDTO) {
  return useQuery({
    queryKey: ['products', storeId, filters],
    queryFn: async (): Promise<PaginatedResult<Product>> => {
      const { data } = await api.get(`/stores/${storeId}/products`, { params: filters });
      // The ApiResponse envelope places our paginated data in data.data and meta in data.meta
      return {
        data: data.data,
        meta: data.meta
      };
    },
    enabled: !!storeId,
  });
}

export function useCreateProduct(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: CreateProductDTO) => {
      const { data } = await api.post(`/stores/${storeId}/products`, productData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    },
  });
}

export function useUpdateProduct(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDTO }) => {
      const response = await api.put(`/stores/${storeId}/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    },
  });
}

export function useDeleteProduct(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stores/${storeId}/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    },
  });
}

export function useBulkImportProducts(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (products: CreateProductDTO[]) => {
      const { data } = await api.post(`/stores/${storeId}/products/bulk`, { products });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    },
  });
}