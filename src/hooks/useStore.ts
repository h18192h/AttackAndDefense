import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../lib/api';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'attack-defense-auth',
    }
  )
);

interface AppStore {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));