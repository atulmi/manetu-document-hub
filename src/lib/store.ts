import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

type StoreState = RoleSlice & SecuritySlice & ThemeSlice & DocSlice & AgentSlice;

const MAX_TASK_HISTORY = 100;

function trimHistory(history: import('../types').AgentTask[], auditEvents: import('../types').AuditEvent[], auditPrompts: Record<string, string>) {
  if (history.length <= MAX_TASK_HISTORY) return { taskHistory: history, auditEvents, auditPrompts };
  const trimmed = history.slice(-MAX_TASK_HISTORY);
  const keepIds = new Set(trimmed.map((t) => t.id));
  return {
    taskHistory: trimmed,
    auditEvents: auditEvents.filter((e) => keepIds.has(e.agentTaskId)),
    auditPrompts: Object.fromEntries(Object.entries(auditPrompts).filter(([k]) => keepIds.has(k))),
  };
}

export const useStore = create<StoreState>()(
  persist(
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
    clearTask: () => set((s) => {
      const newHistory = s.currentTask ? [...s.taskHistory, s.currentTask] : s.taskHistory;
      return {
        currentTask: null,
        ...trimHistory(newHistory, s.auditEvents, s.auditPrompts),
      };
    }),
    clearAudit: () => set({ auditEvents: [], auditPrompts: {}, taskHistory: [] }),
    setViewingTaskId: (id) => set({ viewingTaskId: id }),
  }),
  {
    name: 'manetu-ui-store',
    partialize: (state) => ({
      taskHistory: state.taskHistory,
      auditEvents: state.auditEvents,
      auditPrompts: state.auditPrompts,
      themeMode: state.themeMode,
      activeRole: state.activeRole,
      securityEnabled: state.securityEnabled,
    }) as unknown as StoreState,
    merge: (persisted, current) => ({
      ...current,
      ...(persisted as Partial<StoreState>),
    }),
  },
  )
);
