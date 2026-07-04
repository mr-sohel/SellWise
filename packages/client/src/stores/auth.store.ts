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
  role: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, storeId: string, role: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeStoreId: null,
      role: null,
      isAuthenticated: false,
      setAuth: (user, storeId, role) => set({ user, activeStoreId: storeId, role, isAuthenticated: true }),
      logout: () => set({ user: null, activeStoreId: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'sellwise-auth',
    }
  )
);