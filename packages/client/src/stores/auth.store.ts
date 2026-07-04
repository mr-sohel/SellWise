import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  preferred_lang: 'en' | 'bn';
  created_at: string;
  updated_at: string;
}

interface AuthStore {
  id: string;
  name: string;
  business_type: string | null;
  sales_channels: string[];
}

function cleanStore(raw: any): AuthStore {
  return {
    id: raw.id,
    name: raw.name,
    business_type: raw.business_type ?? null,
    sales_channels: raw.sales_channels ?? [],
  };
}

interface AuthState {
  user: AuthUser | null;
  store: AuthStore | null;
  activeStoreId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, store: AuthStore, role: string | null) => void;
  updateStore: (store: Partial<AuthStore>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      store: null,
      activeStoreId: null,
      role: null,
      isAuthenticated: false,
      setAuth: (user, store, role) => set({
        user,
        store: store ? cleanStore(store) : null,
        activeStoreId: store?.id || null,
        role,
        isAuthenticated: true,
      }),
      updateStore: (partial) => set((state) => ({
        store: state.store ? cleanStore({ ...state.store, ...partial }) : null,
      })),
      logout: () => set({ user: null, store: null, activeStoreId: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'sellwise-auth',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        activeStoreId: state.activeStoreId,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
