import { useStore } from "../../lib/store";
import { useAuditStream } from "../../hooks/useAuditStream";
import { useAgentRun } from "../../hooks/useAgentRun";
import { ListView } from "./ListView";
import { DetailView } from "./DetailView";
import type { PromptGroup } from "./prompt-group";
import { useMemo, useEffect, useCallback } from "react";

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const auditPrompts = useStore((s) => s.auditPrompts);
  const storeEvents = useStore((s) => s.auditEvents);
  const { events: sseEvents } = useAuditStream();
  const { submit, isRunning } = useAgentRun();

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

  if (selectedGroup && viewingTaskId) {
    return (
      <DetailView
        group={selectedGroup}
        task={selectedTask}
        onBack={() => setViewingTaskId(null)}
        onRerun={handleRerun}
      />
    );
  }

  return (
    <ListView
      groups={groups}
      onSelect={setViewingTaskId}
      onRerun={handleRerun}
    />
  );
}

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
