import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Replay from '@mui/icons-material/Replay';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentStep, AgentTask } from '../../types';
import { ThinkingCard } from './ThinkingCard';
import { ToolCallCard } from './ToolCallCard';
import { FinalAnswerCard } from './FinalAnswerCard';
import { StatusMessage } from './StatusMessage';

interface StepTraceProps {
  task: AgentTask;
  onRetry?: (prompt: string) => void;
}

function formatElapsed(startedAt: string, completedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const seconds = ((end - start) / 1000).toFixed(1);
  return `${seconds}s`;
}

export function StepTrace({ task, onRetry }: StepTraceProps) {
  const { steps, status, startedAt, completedAt, finalAnswer, role } = task;
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevTaskId = useRef(task.id);

  useEffect(() => {
    if (task.id !== prevTaskId.current) {
      prevTaskId.current = task.id;
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (status === 'running') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task.id, steps.length, status]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <div ref={topRef} />
      {status === 'running' && steps.length === 0 && (
        <StatusMessage type="connecting" message="Connecting to Claude Sonnet 4.6..." />
      )}

      {status === 'running' && steps.length > 0 && (
        <StatusMessage type="running" message={`Processing — ${steps.length} step${steps.length !== 1 ? 's' : ''} so far`} />
      )}

      <AnimatePresence initial={false}>
        {steps.map((step: AgentStep, i: number) => (
          <motion.div
            key={step.stepNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {step.type === 'thinking' && (
              <ThinkingCard step={step} role={role} collapsed={i < steps.length - 1} />
            )}
            {step.type === 'tool-call' && (
              <ToolCallCard step={step} role={role} />
            )}
            {step.type === 'final-answer' && (
              <FinalAnswerCard step={step} priorSteps={steps.slice(0, i)} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {status === 'running' && steps.length > 0 && (
        <StatusMessage type="running" message={`Processing — ${steps.length} step${steps.length !== 1 ? 's' : ''} so far`} />
      )}

      {status === 'completed' && (
        <StatusMessage
          type="completed"
          message={`Agent completed in ${formatElapsed(startedAt, completedAt)}`}
        />
      )}

      {status === 'failed' && (
        <StatusMessage
          type="failed"
          message={finalAnswer ?? `Agent failed after ${formatElapsed(startedAt, completedAt)}`}
          action={onRetry ? (
            <Button size="small" startIcon={<Replay />} onClick={() => onRetry(task.prompt)} sx={{ fontSize: '0.7rem' }}>
              Retry
            </Button>
          ) : undefined}
        />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
