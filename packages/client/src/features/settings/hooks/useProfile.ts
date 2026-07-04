import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UpdateProfileDTO } from '@sellwise/shared';
import { useAuthStore } from '../../../stores/auth.store';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setAuth, user, activeStoreId } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileDTO) => {
      const response = await axios.put('/auth/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update global auth store with new email if it changed
      if (user && activeStoreId) {
        setAuth({ ...user, email: data.data.email }, activeStoreId);
      }
    }
  });
};
