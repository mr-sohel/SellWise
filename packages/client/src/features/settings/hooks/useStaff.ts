import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api/client';
import type { CreateMemberDTO } from '@sellwise/shared';

export interface StaffMember {
  id: string;
  email: string;
  preferred_lang: string;
  role: 'owner' | 'manager';
  created_at: string;
}

export const useStaff = (storeId: string) => {
  return useQuery({
    queryKey: ['staff', storeId],
    queryFn: async () => {
      if (!storeId) return { data: [] };
      const { data } = await api.get<{ data: StaffMember[] }>(`/stores/${storeId}/members`);
      return data;
    },
    enabled: !!storeId,
  });
};

export const useAddStaff = (storeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: CreateMemberDTO) => {
      const { data } = await api.post(`/stores/${storeId}/members`, memberData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', storeId] });
    },
  });
};

export const useRemoveStaff = (storeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/stores/${storeId}/members/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', storeId] });
    },
  });
};
