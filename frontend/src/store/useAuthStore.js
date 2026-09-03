import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

// The auth token itself lives in an httpOnly cookie set by the backend — it's
// never readable from JS, so it's not stored here. `user` is just cached
// display data for immediate UI hydration; the cookie is what the server
// actually trusts on each request. See ProtectedRoute/AdminRoute for the
// server-side session check this pairs with.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      rememberMe: false,
      login: (user, rememberMe) => set({
        user,
        rememberMe
      }),
      logout: () => {
        set({ user: null, rememberMe: false });
        // Best-effort: clear the httpOnly cookie server-side too. Don't block
        // the redirect on it.
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
        window.location.href = '/login';
      },
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      // Role & Plan helpers
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'ADMIN' || user?.role === 'admin';
      },
      isDriver: () => get().user?.role === 'DRIVER',
      isOrgUser: () => ['ADMIN', 'DRIVER', 'USER', 'admin', 'user'].includes(get().user?.role),
      isIndividual: () => get().user?.role === 'INDIVIDUAL' || !get().user?.role || get().user?.role === 'individual',
      isOrgMember: () => get().isOrgUser(),
      
      // Feature Gating
      hasPlan: (requiredPlan) => {
        const user = get().user;
        const currentPlan = (user?.orgPlan || user?.plan || 'FREE').toUpperCase();
        const plans = ['FREE', 'PRO', 'ENTERPRISE'];
        return plans.indexOf(currentPlan) >= plans.indexOf(requiredPlan.toUpperCase());
      },
      canAccessMaintenance: () => get().hasPlan('PRO'),
      canExportPDF: () => get().hasPlan('PRO'),
      canAccessAuditLog: () => get().hasPlan('ENTERPRISE') && get().isAdmin(),
    }),
    {
      name: 'luxefuel-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
