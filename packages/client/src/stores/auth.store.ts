import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@sellwise/shared';

interface AuthState {
  user: Omit<User, 'password_hash'> | null;
  activeStoreId: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Omit<User, 'password_hash'>, storeId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeStoreId: null,
      isAuthenticated: false,
      setAuth: (user, storeId) => set({ user, activeStoreId: storeId, isAuthenticated: true }),
      logout: () => set({ user: null, activeStoreId: null, isAuthenticated: false }),
    }),
    {
      name: 'sellwise-auth', // localStorage key
    }
  )
);