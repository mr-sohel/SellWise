import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { CreateMemberDTO } from '@sellwise/shared';

// Define the response type for members
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
      const { data } = await axios.get<{ data: StaffMember[] }>(`/stores/${storeId}/members`);
      return data;
    },
    enabled: !!storeId,
  });
};

export const useAddStaff = (storeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: CreateMemberDTO) => {
      const { data } = await axios.post(`/stores/${storeId}/members`, memberData);
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
      const { data } = await axios.delete(`/stores/${storeId}/members/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', storeId] });
    },
  });
};
