import { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { useStore } from "../../lib/store";
import { useAgentRun } from "../../hooks/useAgentRun";
import { usePromptGroups } from "./PromptHistoryPanel";
import { AgentTaskPanel } from "./AgentTaskPanel";
import { PromptHistoryPanel } from "./PromptHistoryPanel";
import { DetailView } from "./DetailView";

export function CenterPanel() {
  const [tab, setTab] = useState(0);
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const { submit, isRunning } = useAgentRun();
  const { groups, count } = usePromptGroups();

  useEffect(() => {
    if (currentTask?.status === "running" && currentTask.id) {
      setViewingTaskId(currentTask.id);
      setTab(1);
    }
  }, [currentTask?.id, currentTask?.status, setViewingTaskId]);

  const handleRerun = useCallback(
    (prompt: string) => {
      if (isRunning) return;
      submit(prompt);
    },
    [submit, isRunning],
  );

  const handleCloseDetail = useCallback(() => {
    setViewingTaskId(null);
  }, [setViewingTaskId]);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 36,
            "& .MuiTab-root": { minHeight: 36, py: 0.5, fontSize: "0.8rem", textTransform: "none", fontWeight: 600 },
          }}
        >
          <Tab label="New Prompt" />
          <Tab
            label={
              <Badge
                badgeContent={count}
                color="primary"
                max={99}
                sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 16, minWidth: 16 } }}
              >
                <Box component="span" sx={{ pr: count > 0 ? 1.5 : 0 }}>
                  Prompt History
                </Box>
              </Badge>
            }
          />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", display: tab === 0 ? "flex" : "none", flexDirection: "column" }}>
        <AgentTaskPanel />
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", display: tab === 1 ? "flex" : "none", flexDirection: "column" }}>
        <PromptHistoryPanel />
      </Box>

      <Dialog
        open={selectedGroup !== null}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            height: "80vh",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {selectedGroup && (
          <>
            <IconButton
              onClick={handleCloseDetail}
              size="small"
              sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
            <DetailView
              group={selectedGroup}
              task={selectedTask}
              onRerun={handleRerun}
            />
          </>
        )}
      </Dialog>
    </Box>
  );
}
