import { useMemo } from "react";
import { useStore } from "../lib/store";
import { useAuditStream } from "./useAuditStream";

export function useAgentStepsHeader() {
  const taskHistory = useStore((s) => s.taskHistory);
  const storeEvents = useStore((s) => s.auditEvents);
  const clearAllHistory = useStore((s) => s.clearAllHistory);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const { events: sseEvents, clear: clearSSE } = useAuditStream();

  const count = useMemo(() => {
    const taskIds = new Set<string>();
    taskHistory.forEach((t) => taskIds.add(t.id));
    [...storeEvents, ...sseEvents].forEach((e) => taskIds.add(e.agentTaskId));
    return taskIds.size;
  }, [taskHistory, storeEvents, sseEvents]);

  const handleClear = () => {
    clearAllHistory();
    clearSSE();
    setViewingTaskId(null);
  };

  const subtitle =
    count > 0 ? `${count} run${count !== 1 ? "s" : ""}` : undefined;

  return { count, subtitle, handleClear };
}
