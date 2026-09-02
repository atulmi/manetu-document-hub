import { useStore } from "../../lib/store";
import { useAgentRun } from "../../hooks/useAgentRun";
import { usePromptHistory } from "../../hooks/usePromptHistory";
import { usePromptRunDetail } from "../../hooks/usePromptRunDetail";
import { ListView } from "./ListView";
import { DetailView } from "./DetailView";
import { useEffect, useCallback } from "react";

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const { submit, isRunning } = useAgentRun();
  const { groups, loading, error } = usePromptHistory();
  const { task: selectedTask, auditEvents: selectedEvents, loading: detailLoading } = usePromptRunDetail(viewingTaskId);

  useEffect(() => {
    if (currentTask?.status === "running" && currentTask.id) {
      setViewingTaskId(currentTask.id);
    }
  }, [currentTask?.id, currentTask?.status, setViewingTaskId]);

  const handleRerun = useCallback(
    (prompt: string) => {
      if (isRunning) return;
      submit(prompt);
    },
    [submit, isRunning],
  );

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

  return (
    <ListView
      groups={groups}
      loading={loading}
      error={error}
      onSelect={setViewingTaskId}
      onRerun={handleRerun}
    />
  );
}
