import { create } from 'zustand';
import { User, AuthResponse } from '../core/entities/user';
import { axiosClient } from '../core/api/axiosClient';
import { ENDPOINTS } from '../core/api/endpoints';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateBalanceAndQuota: (balance: number, quota: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: false,
  isLoading: false,
  error: null,

  setAuth: (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    const user: User = {
      id: data.userId,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      walletBalance: data.walletBalance,
      freeFishQuotaToday: data.freeFishQuotaToday,
    };
    set({
      user,
      token: data.token,
      isAuthenticated: true,
      isAdmin: data.role === 'Admin',
      error: null,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  fetchCurrentUser: async () => {
    const token = get().token;
    if (!token) return;

    try {
      set({ isLoading: true });
      const user = await axiosClient.get<any, User>(ENDPOINTS.AUTH.ME);
      set({
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'Admin',
        isLoading: false,
      });
    } catch {
      get().logout();
      set({ isLoading: false });
    }
  },

  updateBalanceAndQuota: (balance: number, quota: number) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          walletBalance: balance,
          freeFishQuotaToday: quota,
        },
      };
    });
  },
}));
