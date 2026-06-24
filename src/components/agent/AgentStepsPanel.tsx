import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
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
        sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}
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
            variant="outlined"
            sx={{ height: 18, fontSize: "0.6rem" }}
          />
        )}
        {group.denyCount > 0 && (
          <Chip
            label={`${group.denyCount} denied`}
            size="small"
            color="error"
            variant="outlined"
            sx={{ height: 18, fontSize: "0.6rem" }}
          />
        )}
      </Box>
    </Box>
  );
}

function ListView({
  groups,
  connected,
  onSelect,
  onClear,
}: {
  groups: PromptGroup[];
  connected: boolean;
  onSelect: (taskId: string) => void;
  onClear: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 0.75,
          flexShrink: 0,
        }}
      >
        <FiberManualRecord
          sx={{
            fontSize: 8,
            color: connected ? "success.main" : "text.disabled",
            mr: 0.75,
          }}
        />
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontSize: "0.7rem" }}
        >
          {groups.length} prompt run{groups.length !== 1 ? "s" : ""}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {groups.length > 0 && (
          <Button
            size="small"
            onClick={onClear}
            sx={{ fontSize: "0.7rem", minWidth: "auto", px: 1 }}
          >
            Clear
          </Button>
        )}
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {groups.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              No prompt runs yet.
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Submit a prompt in the Agent Task View. Each run will appear here
              — click on it to view the AI agent's reasoning steps, tool calls,
              and policy check results.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ px: 1.5, py: 0.75, bgcolor: "action.hover" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Click a prompt to view its AI agent steps and policy checks
              </Typography>
            </Box>
            <Divider />
            {groups.map((group) => (
              <PromptRow
                key={group.taskId}
                group={group}
                onClick={() => onSelect(group.taskId)}
              />
            ))}
          </>
        )}
      </Box>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
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
                variant="outlined"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
            {group.denyCount > 0 && (
              <Chip
                label={`${group.denyCount} denied`}
                size="small"
                color="error"
                variant="outlined"
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
                  Policy checks ({group.events.length})
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
  const clearAudit = useStore((s) => s.clearAudit);
  const { events: sseEvents, connected } = useAuditStream();

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
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    const groupMap = new Map<string, PromptGroup>();
    for (const event of allEvents) {
      let group = groupMap.get(event.agentTaskId);
      if (!group) {
        group = {
          taskId: event.agentTaskId,
          prompt: auditPrompts[event.agentTaskId] ?? "Unknown prompt",
          role: event.principal,
          timestamp: event.timestamp,
          status: "completed",
          events: [],
          allowCount: 0,
          denyCount: 0,
        };
        groupMap.set(event.agentTaskId, group);
      }
      group.events.push(event);
      if (event.decision === "allow" || event.decision === "bypassed")
        group.allowCount++;
      if (event.decision === "deny") group.denyCount++;
    }

    return [...groupMap.values()].reverse();
  }, [sseEvents, storeEvents, auditPrompts]);

  const selectedGroup = viewingTaskId
    ? groups.find((g) => g.taskId === viewingTaskId)
    : null;

  const selectedTask = viewingTaskId
    ? (taskHistory.find((t) => t.id === viewingTaskId) ??
      (currentTask?.id === viewingTaskId ? currentTask : null))
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
      connected={connected}
      onSelect={setViewingTaskId}
      onClear={() => {
        clearAudit();
        setViewingTaskId(null);
      }}
    />
  );
}
