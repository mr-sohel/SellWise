import { useMutation } from '@tanstack/react-query';
import api from '../../../lib/api/client';
import type { UpdateProfileDTO } from '@sellwise/shared';
import { useAuthStore } from '../../../stores/auth.store';

export const useUpdateProfile = () => {
  const { setAuth, user, store, role } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileDTO) => {
      const response = await api.put('/auth/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (user && store) {
        setAuth({ ...user, email: data.data.email }, store, role);
      }
    }
  });
};
