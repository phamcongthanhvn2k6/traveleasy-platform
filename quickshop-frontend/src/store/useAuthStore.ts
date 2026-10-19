import { create } from 'zustand';
import { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('quickshop_token'),
  user: localStorage.getItem('quickshop_user')
    ? JSON.parse(localStorage.getItem('quickshop_user')!)
    : null,
  setAuth: (token, user) => {
    localStorage.setItem('quickshop_token', token);
    localStorage.setItem('quickshop_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('quickshop_token');
    localStorage.removeItem('quickshop_user');
    set({ token: null, user: null });
  },
}));
