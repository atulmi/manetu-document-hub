import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useStore } from "../../lib/store";
import { useAuditStream } from "../../hooks/useAuditStream";
import { StepTrace } from "./StepTrace";
import { AuditEventRow } from "../audit/AuditEventRow";
import type { AuditEvent } from "../../types";
import { useMemo, useEffect } from "react";

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
}: {
  group: PromptGroup;
  onClick: () => void;
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
        px: 1.5,
        py: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        borderBottom: 1,
        borderColor: "divider",
        transition: "background-color 0.15s",
      }}
    >
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
      </Box>
    </Box>
  );
}

function ListView({
  groups,
  onSelect,
}: {
  groups: PromptGroup[];
  onSelect: (taskId: string) => void;
}) {
  if (groups.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          No prompt runs yet.
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Submit a prompt in the Agent Task View. Each run will appear here
          — click to view the AI agent's reasoning steps, tool calls,
          and policy check results.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Box sx={{ px: 1.5, py: 1, mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Click a prompt to view its AI agent steps and policy checks
        </Typography>
      </Box>
      {groups.map((group) => (
        <PromptRow
          key={group.taskId}
          group={group}
          onClick={() => onSelect(group.taskId)}
        />
      ))}
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
                  Policy checks ({group.events.length} total  )
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
        const taskPrompt = auditPrompts[event.agentTaskId]
          ?? taskHistory.find((t) => t.id === event.agentTaskId)?.prompt
          ?? (currentTask?.id === event.agentTaskId ? currentTask.prompt : null)
          ?? "Unknown prompt";
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

    return [...groupMap.values()]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
        return taskHistory.find((t) => t.prompt === group.prompt && t.role === group.role) ?? null;
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
  return (
    <ListView
      groups={groups}
      onSelect={setViewingTaskId}
    />
  );
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

  const subtitle = count > 0 ? `${count} run${count !== 1 ? "s" : ""}` : undefined;

  return { count, subtitle, handleClear };
}
