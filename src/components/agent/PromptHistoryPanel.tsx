import { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import MoreVert from "@mui/icons-material/MoreVert";
import FileDownload from "@mui/icons-material/FileDownload";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useStore } from "../../lib/store";
import { useAuditStream } from "../../hooks/useAuditStream";
import { useAgentRun } from "../../hooks/useAgentRun";
import { exportFullReport } from "../../lib/export-txt";
import { ListView } from "./ListView";
import type { PromptGroup } from "./prompt-group";

export function usePromptGroups() {
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const auditPrompts = useStore((s) => s.auditPrompts);
  const storeEvents = useStore((s) => s.auditEvents);
  const { events: sseEvents } = useAuditStream();

  const groups = useMemo(() => {
    const seen = new Set<string>();
    const allEvents = [...storeEvents, ...sseEvents]
      .filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    const groupMap = new Map<string, PromptGroup>();

    for (const task of taskHistory) {
      groupMap.set(task.id, {
        taskId: task.id,
        prompt: task.prompt,
        role: task.role,
        timestamp: task.startedAt,
        status: task.status,
        events: [],
        allowCount: 0,
        denyCount: 0,
        bypassedCount: 0,
      });
    }

    for (const event of allEvents) {
      let group = groupMap.get(event.agentTaskId);
      if (!group) {
        const taskPrompt =
          auditPrompts[event.agentTaskId] ??
          taskHistory.find((t) => t.id === event.agentTaskId)?.prompt ??
          (currentTask?.id === event.agentTaskId ? currentTask.prompt : null) ??
          "Unknown prompt";
        group = {
          taskId: event.agentTaskId,
          prompt: taskPrompt,
          role: event.principal,
          timestamp: event.timestamp,
          status: "completed",
          events: [],
          allowCount: 0,
          denyCount: 0,
          bypassedCount: 0,
        };
        groupMap.set(event.agentTaskId, group);
      }
      group.events.push(event);
      if (event.decision === "allow") group.allowCount++;
      if (event.decision === "deny") group.denyCount++;
      if (event.decision === "bypassed") group.bypassedCount++;
    }

    return [...groupMap.values()].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [sseEvents, storeEvents, auditPrompts, taskHistory, currentTask]);

  const count = useMemo(() => {
    const taskIds = new Set<string>();
    taskHistory.forEach((t) => taskIds.add(t.id));
    [...storeEvents, ...sseEvents].forEach((e) => taskIds.add(e.agentTaskId));
    return taskIds.size;
  }, [taskHistory, storeEvents, sseEvents]);

  return { groups, count };
}

export function PromptHistoryPanel() {
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const taskHistory = useStore((s) => s.taskHistory);
  const auditEvents = useStore((s) => s.auditEvents);
  const clearAllHistory = useStore((s) => s.clearAllHistory);
  const { clear: clearSSE } = useAuditStream();
  const { submit, isRunning } = useAgentRun();
  const { groups, count } = usePromptGroups();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRerun = useCallback(
    (prompt: string) => {
      if (isRunning) return;
      submit(prompt);
    },
    [submit, isRunning],
  );

  const handleClear = () => {
    clearAllHistory();
    clearSSE();
    setViewingTaskId(null);
    setConfirmOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {count > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 1.5,
            pt: 0.5,
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVert sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                exportFullReport(taskHistory, auditEvents);
              }}
            >
              <ListItemIcon>
                <FileDownload fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export all prompt runs</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setConfirmOpen(true);
              }}
            >
              <ListItemIcon>
                <DeleteOutline fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>
                Clear all history
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <ListView
          groups={groups}
          onSelect={setViewingTaskId}
          onRerun={handleRerun}
        />
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="clear-dialog-title"
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <DeleteOutline />
          <Typography
            id="clear-dialog-title"
            variant="subtitle1"
            sx={{ fontWeight: 700 }}
          >
            Clear all history?
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <DialogContentText sx={{ color: "text.primary", lineHeight: 1.7 }}>
            This will permanently delete all {count} prompt run
            {count !== 1 ? "s" : ""}, including agent steps and audit events.
            This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={handleClear}>
            Clear history
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
