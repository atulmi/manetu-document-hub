import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useStore } from "../../lib/store";
import { useAuditStream } from "../../hooks/useAuditStream";
import { exportSingleRun } from "../../lib/export-txt";
import { StepTrace } from "./StepTrace";
import { AuditEventRow } from "../audit/AuditEventRow";
import type { AuditEvent } from "../../types";
import { useState, useMemo, useEffect } from "react";

interface PromptGroup {
  taskId: string;
  prompt: string;
  role: string;
  timestamp: string;
  status: string;
  events: AuditEvent[];
  allowCount: number;
  denyCount: number;
  bypassedCount: number;
}

function PromptRow({
  group,
  onClick,
  onExport,
  onDelete,
}: {
  group: PromptGroup;
  onClick: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const time = new Date(group.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(group.timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1.5,
        py: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        borderBottom: 1,
        borderColor: "divider",
        transition: "background-color 0.15s",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }} noWrap>
          {group.prompt}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.7rem" }}
          >
            {group.role} · {date} {time}
          </Typography>
          {group.allowCount > 0 && (
            <Chip
              label={`${group.allowCount} allowed`}
              size="small"
              color="success"
              variant="filled"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {group.denyCount > 0 && (
            <Chip
              label={`${group.denyCount} denied`}
              size="small"
              color="error"
              variant="filled"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {group.bypassedCount > 0 && (
            <Chip
              label={`${group.bypassedCount} bypassed`}
              size="small"
              color="warning"
              variant="filled"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {group.status === "failed" && (
            <Chip
              label="stopped"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {group.status === "completed" && (
            <Chip
              label="completed"
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
        </Box>
      </Box>
      <Tooltip title="Export this run">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onExport(); }}
          sx={{ flexShrink: 0, ml: 0.5 }}
        >
          <FileDownloadOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete this run">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          sx={{ flexShrink: 0 }}
        >
          <DeleteOutline sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <ChevronRight
        sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }}
      />
    </Box>
  );
}

const PAGE_SIZE = 10;

type StatusFilter = "all" | "completed" | "failed";
type DecisionFilter = "all" | "allowed" | "denied" | "bypassed";

function ListView({
  groups,
  onSelect,
}: {
  groups: PromptGroup[];
  onSelect: (taskId: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const ALL_ROLES = ["viewer", "developer", "data-analyst", "auditor", "admin"];

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      if (roleFilter !== "all" && g.role !== roleFilter) return false;
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (decisionFilter === "allowed" && g.allowCount === 0) return false;
      if (decisionFilter === "denied" && g.denyCount === 0) return false;
      if (decisionFilter === "bypassed" && g.bypassedCount === 0) return false;
      return true;
    });
  }, [groups, roleFilter, statusFilter, decisionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(0);
  }, [roleFilter, statusFilter, decisionFilter]);

  if (groups.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          No prompt runs yet.
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Submit a prompt in the Agent Task View. Each run will appear here —
          click to view the AI agent's reasoning steps, tool calls, and policy
          check results.
        </Typography>
      </Box>
    );
  }

  const hasActiveFilters =
    roleFilter !== "all" || statusFilter !== "all" || decisionFilter !== "all";
  const selectSx = {
    minWidth: 100,
    ".MuiSelect-select": { py: 0.5, fontSize: "0.75rem" },
    bgcolor: "action.hover",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Filters */}
      <Box
        sx={{
          px: 1.5,
          mb: 1.5,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.65rem",
              display: "block",
              mb: 0.25,
            }}
          >
            User role
          </Typography>
          <FormControl size="small">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={selectSx}
            >
              <MenuItem value="all">All roles</MenuItem>
              {ALL_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.65rem",
              display: "block",
              mb: 0.25,
            }}
          >
            Job status
          </Typography>
          <FormControl size="small">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              sx={selectSx}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Stopped</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.65rem",
              display: "block",
              mb: 0.25,
            }}
          >
            Policy decision
          </Typography>
          <FormControl size="small">
            <Select
              value={decisionFilter}
              onChange={(e) =>
                setDecisionFilter(e.target.value as DecisionFilter)
              }
              sx={selectSx}
            >
              <MenuItem value="all">All decisions</MenuItem>
              <MenuItem value="allowed">Has allowed</MenuItem>
              <MenuItem value="denied">Has denied</MenuItem>
              <MenuItem value="bypassed">Has bypassed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {hasActiveFilters && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontSize: "0.65rem" }}
          >
            {filtered.length} of {groups.length}
          </Typography>
        )}
      </Box>
      <Divider />
      {/* List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {paged.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.disabled">
              No runs match the selected filters.
            </Typography>
          </Box>
        ) : (
          paged.map((group) => (
            <PromptRow
              key={group.taskId}
              group={group}
              onClick={() => onSelect(group.taskId)}
              onExport={() => {
                const { taskHistory, auditEvents } = useStore.getState();
                const task = taskHistory.find((t) => t.id === group.taskId);
                if (task) exportSingleRun(task, auditEvents);
              }}
              onDelete={() => setPendingDeleteId(group.taskId)}
            />
          ))
        )}
      </Box>
      {groups.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            py: 0.75,
            borderTop: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft sx={{ fontSize: 18 }} />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => (
            <Box
              key={i}
              onClick={() => setPage(i)}
              sx={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: page === i ? "primary.main" : "transparent",
                color: page === i ? "primary.contrastText" : "text.secondary",
                "&:hover": {
                  bgcolor: page === i ? "primary.dark" : "action.hover",
                },
                transition: "background-color 0.15s",
              }}
            >
              {i + 1}
            </Box>
          ))}
          <IconButton
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      <Dialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <DeleteOutline />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Delete this prompt run?
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <DialogContentText sx={{ color: "text.primary", lineHeight: 1.7 }}>
            This will permanently delete this prompt run and its agent steps and policy checks.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPendingDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (pendingDeleteId) useStore.getState().deleteTaskById(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function DetailView({
  group,
  task,
  onBack,
}: {
  group: PromptGroup;
  task: ReturnType<typeof useStore.getState>["currentTask"];
  onBack: () => void;
}) {
  const time = new Date(group.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(group.timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          px: 1.5,
          py: 1,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <IconButton size="small" onClick={onBack} sx={{ mt: 0.25 }}>
          <ArrowBack sx={{ fontSize: 18 }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {group.prompt}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {group.role} · {date} {time}
            </Typography>
            {group.allowCount > 0 && (
              <Chip
                label={`${group.allowCount} allowed`}
                size="small"
                color="success"
                variant="filled"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
            {group.denyCount > 0 && (
              <Chip
                label={`${group.denyCount} denied`}
                size="small"
                color="error"
                variant="filled"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
            {group.bypassedCount > 0 && (
              <Chip
                label={`${group.bypassedCount} bypassed`}
                size="small"
                color="warning"
                variant="filled"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Step trace + policy checks */}
      <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
        {task ? (
          <>
            <StepTrace task={task} />
            {group.events.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Policy checks ({group.events.length} total )
                </Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {group.events.map((event) => (
                    <AuditEventRow key={event.id} event={event} />
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.disabled">
            Step details not available for this run.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const auditPrompts = useStore((s) => s.auditPrompts);
  const storeEvents = useStore((s) => s.auditEvents);
  const { events: sseEvents } = useAuditStream();

  // Auto-switch to detail view when a new task starts
  useEffect(() => {
    if (currentTask?.status === "running" && currentTask.id) {
      setViewingTaskId(currentTask.id);
    }
  }, [currentTask?.id, currentTask?.status, setViewingTaskId]);

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

    // Seed from task history so tasks without audit events still appear
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

  const selectedGroup = viewingTaskId
    ? groups.find((g) => g.taskId === viewingTaskId)
    : null;

  const selectedTask = viewingTaskId
    ? (taskHistory.find((t) => t.id === viewingTaskId) ??
      (currentTask?.id === viewingTaskId ? currentTask : null) ??
      // Fallback: match by prompt text for tasks with mismatched IDs
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

  // Detail view
  if (selectedGroup && viewingTaskId) {
    return (
      <DetailView
        group={selectedGroup}
        task={selectedTask}
        onBack={() => setViewingTaskId(null)}
      />
    );
  }

  // List view
  return <ListView groups={groups} onSelect={setViewingTaskId} />;
}

export function useAgentStepsHeader() {
  const taskHistory = useStore((s) => s.taskHistory);
  const storeEvents = useStore((s) => s.auditEvents);
  const clearAudit = useStore((s) => s.clearAudit);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const { events: sseEvents, clear: clearSSE } = useAuditStream();

  const count = useMemo(() => {
    const taskIds = new Set<string>();
    taskHistory.forEach((t) => taskIds.add(t.id));
    [...storeEvents, ...sseEvents].forEach((e) => taskIds.add(e.agentTaskId));
    return taskIds.size;
  }, [taskHistory, storeEvents, sseEvents]);

  const handleClear = () => {
    clearAudit();
    clearSSE();
    setViewingTaskId(null);
  };

  const subtitle =
    count > 0 ? `${count} run${count !== 1 ? "s" : ""}` : undefined;

  return { count, subtitle, handleClear };
}
