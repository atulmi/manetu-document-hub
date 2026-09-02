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
  // Finished runs pending confirmation from Elasticsearch (see useHistorySync).
  // A run's id lives here from the moment it finishes until the backend
  // confirms it was durably indexed — this is the write-side durability
  // buffer described in ISSUE-030, not a cache of what's already synced.
  unsyncedTaskIds: string[];
  historyVersion: number;
  setTask: (task: AgentTask) => void;
  appendStep: (step: AgentStep) => void;
  appendAuditEvent: (event: AuditEvent) => void;
  finishTask: (task: AgentTask) => void;
  clearAllHistory: () => void;
  deleteTaskById: (id: string) => void;
  markSynced: (id: string) => void;
  bumpHistoryVersion: () => void;
  setViewingTaskId: (id: string | null) => void;
}

type StoreState = RoleSlice & SecuritySlice & ThemeSlice & DocSlice & AgentSlice;

const MAX_TASK_HISTORY = 100;

function trimHistory(
  history: import('../types').AgentTask[],
  auditEvents: import('../types').AuditEvent[],
  auditPrompts: Record<string, string>,
  unsyncedTaskIds: string[],
) {
  if (history.length <= MAX_TASK_HISTORY) return { taskHistory: history, auditEvents, auditPrompts, unsyncedTaskIds };
  const trimmed = history.slice(-MAX_TASK_HISTORY);
  const keepIds = new Set(trimmed.map((t) => t.id));
  return {
    taskHistory: trimmed,
    auditEvents: auditEvents.filter((e) => keepIds.has(e.agentTaskId)),
    auditPrompts: Object.fromEntries(Object.entries(auditPrompts).filter(([k]) => keepIds.has(k))),
    unsyncedTaskIds: unsyncedTaskIds.filter((id) => keepIds.has(id)),
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
    unsyncedTaskIds: [],
    historyVersion: 0,
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
    // Called by useAgentRun's completion paths (the SSE 'done' handler, the
    // stream-ended fallback, and failTask) with the finished task. This is
    // what actually populates the write-side durability buffer described in
    // ISSUE-030 — a run isn't "finished" from the sync loop's perspective
    // until it lands here.
    finishTask: (task) => set((s) => {
      const historyWithoutOld = s.taskHistory.filter((t) => t.id !== task.id);
      const newUnsynced = s.unsyncedTaskIds.includes(task.id)
        ? s.unsyncedTaskIds
        : [...s.unsyncedTaskIds, task.id];
      const trimmed = trimHistory([...historyWithoutOld, task], s.auditEvents, s.auditPrompts, newUnsynced);
      return {
        currentTask: null,
        viewingTaskId: task.id,
        ...trimmed,
        auditPrompts: { ...trimmed.auditPrompts, [task.id]: task.prompt },
        historyVersion: s.historyVersion + 1,
      };
    }),
    clearAllHistory: () => set((s) => ({
      auditEvents: [],
      auditPrompts: {},
      taskHistory: [],
      unsyncedTaskIds: [],
      historyVersion: s.historyVersion + 1,
    })),
    deleteTaskById: (id) => set((s) => ({
      taskHistory: s.taskHistory.filter((t) => t.id !== id),
      auditEvents: s.auditEvents.filter((e) => e.agentTaskId !== id),
      auditPrompts: Object.fromEntries(Object.entries(s.auditPrompts).filter(([k]) => k !== id)),
      unsyncedTaskIds: s.unsyncedTaskIds.filter((t) => t !== id),
      viewingTaskId: s.viewingTaskId === id ? null : s.viewingTaskId,
      historyVersion: s.historyVersion + 1,
    })),
    markSynced: (id) => set((s) => ({
      taskHistory: s.taskHistory.filter((t) => t.id !== id),
      auditEvents: s.auditEvents.filter((e) => e.agentTaskId !== id),
      auditPrompts: Object.fromEntries(Object.entries(s.auditPrompts).filter(([k]) => k !== id)),
      unsyncedTaskIds: s.unsyncedTaskIds.filter((t) => t !== id),
      historyVersion: s.historyVersion + 1,
    })),
    bumpHistoryVersion: () => set((s) => ({ historyVersion: s.historyVersion + 1 })),
    setViewingTaskId: (id) => set({ viewingTaskId: id }),
  }),
  {
    name: 'manetu-ui-store',
    partialize: (state) => ({
      taskHistory: state.taskHistory,
      auditEvents: state.auditEvents,
      auditPrompts: state.auditPrompts,
      unsyncedTaskIds: state.unsyncedTaskIds,
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
