import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api/client';
import type { Category, CreateCategoryDTO } from '@sellwise/shared';

export function useCategories(storeId: string) {
  return useQuery({
    queryKey: ['categories', storeId],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get(`/stores/${storeId}/categories`);
      return data.data;
    },
    enabled: !!storeId,
  });
}

export function useCreateCategory(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryDTO) => {
      const { data: result } = await api.post(`/stores/${storeId}/categories`, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
    },
  });
}
