import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useStore } from "../../lib/store";
import { useAgentRun } from "../../hooks/useAgentRun";
import { usePromptGroups } from "./PromptHistoryPanel";
import { DetailView } from "./DetailView";
import { useEffect, useCallback } from "react";

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const { submit, isRunning } = useAgentRun();
  const { groups } = usePromptGroups();

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

  const selectedTask = viewingTaskId
    ? (taskHistory.find((t) => t.id === viewingTaskId) ??
      (currentTask?.id === viewingTaskId ? currentTask : null) ??
      (() => {
        const group = groups.find((g) => g.taskId === viewingTaskId);
        if (!group) return null;
        return (
          taskHistory.find(
            (t) => t.prompt === group.prompt && t.role === group.role,
          ) ?? null
        );
      })())
    : null;

  if (selectedGroup) {
    return (
      <DetailView
        group={selectedGroup}
        task={selectedTask}
        onRerun={handleRerun}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 1,
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
        No run selected
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 260 }}>
        Submit a new prompt or select a run from Prompt History to view agent
        steps and policy checks.
      </Typography>
    </Box>
  );
}
