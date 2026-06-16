import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { users, getCurrentTeacher, getCurrentStudent } from '../data/users';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  selectedRole: UserRole | null;
  login: (username: string, password: string, role: UserRole) => void;
  logout: () => void;
  setSelectedRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  selectedRole: null,

  login: (username: string, password: string, role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, selectedRole: null });
  },

  setSelectedRole: (role: UserRole) => {
    set({ selectedRole: role });
  },
}));
