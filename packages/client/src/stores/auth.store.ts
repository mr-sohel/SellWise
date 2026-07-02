import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  preferred_lang: 'en' | 'bn';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: AuthUser | null;
  activeStoreId: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, storeId: string) => void;
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
      name: 'sellwise-auth',
    }
  )
);