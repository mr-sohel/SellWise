import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api/client';
import type { Expense, CreateExpenseDTO, ExpenseFiltersDTO, PaginatedResult } from '@sellwise/shared';

export function useExpenses(storeId: string, filters: ExpenseFiltersDTO) {
  return useQuery({
    queryKey: ['expenses', storeId, filters],
    queryFn: async (): Promise<PaginatedResult<Expense>> => {
      const { data } = await api.get(`/stores/${storeId}/expenses`, { params: filters });
      return { data: data.data, meta: data.meta };
    },
    enabled: !!storeId,
  });
}

export function useCreateExpense(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseData: CreateExpenseDTO) => {
      const { data } = await api.post(`/stores/${storeId}/expenses`, expenseData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', storeId] });
    },
  });
}

export function useDeleteExpense(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stores/${storeId}/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', storeId] });
    },
  });
}
