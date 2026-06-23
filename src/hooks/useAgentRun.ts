import { useRef, useCallback } from 'react';
import { useStore } from '../lib/store';
import type { AgentStep, AuditEvent } from '../types';

export function useAgentRun() {
  const abortRef = useRef<AbortController | null>(null);
  const currentTask = useStore((s) => s.currentTask);

  const submit = useCallback(async (prompt: string) => {
    const { activeRole, securityEnabled, setTask, appendStep, appendAuditEvent } = useStore.getState();

    const taskId = crypto.randomUUID();
    setTask({
      id: taskId,
      prompt,
      role: activeRole,
      status: 'running',
      steps: [],
      startedAt: new Date().toISOString(),
    });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': activeRole,
          'x-security-enabled': String(securityEnabled),
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        useStore.setState((s) => ({
          currentTask: s.currentTask ? { ...s.currentTask, status: 'failed' } : null,
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const json = line.slice(6);
            try {
              const data = JSON.parse(json) as Record<string, unknown>;
              if (eventType === 'step') {
                appendStep(data as unknown as AgentStep);
              } else if (eventType === 'audit') {
                appendAuditEvent(data as unknown as AuditEvent);
              } else if (eventType === 'done') {
                useStore.setState((s) => ({
                  currentTask: s.currentTask
                    ? { ...s.currentTask, status: 'completed', completedAt: new Date().toISOString() }
                    : null,
                }));
              } else if (eventType === 'error') {
                useStore.setState((s) => ({
                  currentTask: s.currentTask ? { ...s.currentTask, status: 'failed' } : null,
                }));
              }
            } catch {
              // skip malformed JSON
            }
            eventType = '';
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        useStore.setState((s) => ({
          currentTask: s.currentTask ? { ...s.currentTask, status: 'failed' } : null,
        }));
      }
    } finally {
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    useStore.setState((s) => ({
      currentTask: s.currentTask
        ? { ...s.currentTask, status: 'failed', completedAt: new Date().toISOString() }
        : null,
    }));
  }, []);

  return {
    submit,
    stop,
    isRunning: currentTask?.status === 'running',
  };
}
