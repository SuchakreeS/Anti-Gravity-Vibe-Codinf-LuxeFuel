import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      rememberMe: false,
      login: (user, token, rememberMe) => set({ 
        user, 
        token, 
        rememberMe 
      }),
      logout: () => {
        set({ user: null, token: null, rememberMe: false });
        window.location.href = '/login';
      },
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      // Role helpers
      isAdmin: () => get().user?.role === 'admin',
      isOrgUser: () => get().user?.role === 'user',
      isIndividual: () => get().user?.role === 'individual' || !get().user?.role,
      isOrgMember: () => ['admin', 'user'].includes(get().user?.role),
    }),
    {
      name: 'luxefuel-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
