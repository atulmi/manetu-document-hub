import { useStore } from "../../lib/store";
import { useAgentRun } from "../../hooks/useAgentRun";
import { usePromptHistory } from "../../hooks/usePromptHistory";
import { usePromptRunDetail } from "../../hooks/usePromptRunDetail";
import { ListView } from "./ListView";
import { DetailView } from "./DetailView";
import { RunDetailModal } from "./RunDetailModal";
import { useEffect, useCallback, useState } from "react";
import type { UserRole } from "../../types";

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const activeRole = useStore((s) => s.activeRole);
  const setRole = useStore((s) => s.setRole);
  const { submit, isRunning } = useAgentRun();
  const { groups, loading, error } = usePromptHistory();
  const { task: selectedTask, auditEvents: selectedEvents, loading: detailLoading } = usePromptRunDetail(viewingTaskId);
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (currentTask?.status === "running" && currentTask.id) {
      setViewingTaskId(currentTask.id);
    }
  }, [currentTask?.id, currentTask?.status, setViewingTaskId]);

  const handleRerun = useCallback(
    (prompt: string, role: UserRole) => {
      if (isRunning) return;
      // Re-running under a different role flips the global role switcher —
      // the same, already-tested path a manual switch takes (doc-library
      // refetch, toast, task reset) — rather than a separate per-request
      // role override the backend has no concept of today. See i-rerun-as-role.
      if (role !== activeRole) setRole(role);
      submit(prompt);
    },
    [submit, isRunning, activeRole, setRole],
  );

  // The live-tracked run (currently running, or just finished and not yet
  // backed out of) stays inline — that's the "watch it happen" moment.
  const selectedGroup = viewingTaskId
    ? groups.find((g) => g.taskId === viewingTaskId)
    : null;

  if (selectedGroup && viewingTaskId) {
    return (
      <DetailView
        group={selectedGroup}
        task={selectedTask}
        auditEvents={selectedEvents}
        loading={detailLoading}
        onBack={() => setViewingTaskId(null)}
      />
    );
  }

  // Anything picked from the list is a historical run — open it wide in a
  // modal instead of cramping the panel, since there's no live content to
  // watch alongside the composer for these.
  const modalGroup = modalTaskId
    ? groups.find((g) => g.taskId === modalTaskId)
    : null;

  return (
    <>
      <ListView
        groups={groups}
        loading={loading}
        error={error}
        onSelect={setModalTaskId}
        onRerun={handleRerun}
      />
      {modalTaskId && modalGroup && (
        <RunDetailModal
          taskId={modalTaskId}
          group={modalGroup}
          onClose={() => setModalTaskId(null)}
        />
      )}
    </>
  );
}
