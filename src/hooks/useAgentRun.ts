import { useRef, useCallback } from 'react';
import { useStore } from '../lib/store';
import type { AgentStep, AuditEvent } from '../types';

function failTask(message: string) {
  useStore.setState((s) => ({
    currentTask: s.currentTask
      ? { ...s.currentTask, status: 'failed', finalAnswer: message, completedAt: new Date().toISOString() }
      : null,
  }));
}

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

    let res: Response;
    try {
      res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': activeRole,
          'x-security-enabled': String(securityEnabled),
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        failTask('Cannot reach the backend server. Start it with: npm run server:dev');
      }
      return;
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.includes('text/event-stream')) {
      let message = `Server error (${res.status})`;
      try {
        if (contentType.includes('application/json')) {
          const body = await res.json() as { error?: string };
          if (body.error) message = body.error;
        } else {
          message = 'Backend server is not running. Start it with: npm run server:dev';
        }
      } catch { /* use default message */ }
      failTask(message);
      return;
    }

    try {
      const reader = res.body!.getReader();
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
                const msg = (data as { message?: string }).message ?? 'Agent error';
                failTask(msg);
              }
            } catch {
              // skip malformed JSON
            }
            eventType = '';
          }
        }
      }

      // Stream ended — if task is still running, mark it completed
      useStore.setState((s) => ({
        currentTask: s.currentTask?.status === 'running'
          ? { ...s.currentTask, status: 'completed', completedAt: new Date().toISOString() }
          : s.currentTask,
      }));
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        failTask('Connection to agent lost unexpectedly.');
      }
    } finally {
      abortRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    failTask('Stopped by user.');
  }, []);

  return {
    submit,
    stop,
    isRunning: currentTask?.status === 'running',
  };
}
