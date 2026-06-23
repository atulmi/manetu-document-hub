import { create } from 'zustand';
import type { PaletteMode } from '@mui/material/styles';
import type { UserRole, AgentTask, AgentStep } from '../types';

interface RoleSlice {
  activeRole: UserRole;
  refetchTrigger: number;
  setRole: (role: UserRole) => void;
}
interface SecuritySlice {
  securityEnabled: boolean;
  toggleSecurity: () => void;
}
interface ThemeSlice {
  themeMode: PaletteMode;
  toggleTheme: () => void;
}
interface AgentSlice {
  currentTask: AgentTask | null;
  setTask: (task: AgentTask) => void;
  appendStep: (step: AgentStep) => void;
  clearTask: () => void;
}

export const useStore = create<RoleSlice & SecuritySlice & ThemeSlice & AgentSlice>()(
  (set) => ({
    activeRole: 'viewer',
    refetchTrigger: 0,
    setRole: (role) => set((s) => ({
      activeRole: role,
      refetchTrigger: s.refetchTrigger + 1,
      currentTask: null,
    })),
    securityEnabled: true,
    toggleSecurity: () => set((s) => ({ securityEnabled: !s.securityEnabled })),
    themeMode: 'dark',
    toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
    currentTask: null,
    setTask: (task) => set({ currentTask: task }),
    appendStep: (step) => set((s) => ({
      currentTask: s.currentTask
        ? { ...s.currentTask, steps: [...s.currentTask.steps, step] }
        : null,
    })),
    clearTask: () => set({ currentTask: null }),
  })
);
