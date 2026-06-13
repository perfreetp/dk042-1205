import { create } from 'zustand';
import type { User } from '@/types';
import { currentUser } from '@/data/systems';

interface UserState {
  currentUser: User;
  notifications: number;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser,
  notifications: 5,
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
