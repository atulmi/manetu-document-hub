import { create } from 'zustand';
import type { PaletteMode } from '@mui/material/styles';
import type { UserRole, AgentTask, AgentStep, AuditEvent, DocMeta } from '../types';

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
interface DocSlice {
  selectedDoc: DocMeta | null;
  selectDoc: (doc: DocMeta | null) => void;
}
interface AgentSlice {
  currentTask: AgentTask | null;
  taskHistory: AgentTask[];
  viewingTaskId: string | null;
  auditEvents: AuditEvent[];
  auditPrompts: Record<string, string>;
  setTask: (task: AgentTask) => void;
  appendStep: (step: AgentStep) => void;
  appendAuditEvent: (event: AuditEvent) => void;
  clearTask: () => void;
  clearAudit: () => void;
  setViewingTaskId: (id: string | null) => void;
}

export const useStore = create<RoleSlice & SecuritySlice & ThemeSlice & DocSlice & AgentSlice>()(
  (set) => ({
    activeRole: 'viewer',
    refetchTrigger: 0,
    setRole: (role) => set((s) => ({
      activeRole: role,
      refetchTrigger: s.refetchTrigger + 1,
      currentTask: null,
      selectedDoc: null,
    })),
    securityEnabled: true,
    toggleSecurity: () => set((s) => ({ securityEnabled: !s.securityEnabled })),
    themeMode: 'light',
    toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
    selectedDoc: null,
    selectDoc: (doc) => set({ selectedDoc: doc }),
    currentTask: null,
    taskHistory: [],
    viewingTaskId: null,
    auditEvents: [],
    auditPrompts: {},
    setTask: (task) => set((s) => ({
      currentTask: task,
      viewingTaskId: null,
      auditPrompts: { ...s.auditPrompts, [task.id]: task.prompt },
    })),
    appendStep: (step) => set((s) => ({
      currentTask: s.currentTask
        ? { ...s.currentTask, steps: [...s.currentTask.steps, step] }
        : null,
    })),
    appendAuditEvent: (event) => set((s) => ({
      auditEvents: [...s.auditEvents, event],
      auditPrompts: s.currentTask && !s.auditPrompts[event.agentTaskId]
        ? { ...s.auditPrompts, [event.agentTaskId]: s.currentTask.prompt }
        : s.auditPrompts,
    })),
    clearTask: () => set((s) => ({
      currentTask: null,
      taskHistory: s.currentTask
        ? [...s.taskHistory, s.currentTask]
        : s.taskHistory,
    })),
    clearAudit: () => set({ auditEvents: [], auditPrompts: {}, taskHistory: [] }),
    setViewingTaskId: (id) => set({ viewingTaskId: id }),
  })
);
