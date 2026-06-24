import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentStep, AgentTask } from '../../types';
import { ThinkingCard } from './ThinkingCard';
import { ToolCallCard } from './ToolCallCard';
import { FinalAnswerCard } from './FinalAnswerCard';
import { StatusMessage } from './StatusMessage';

interface StepTraceProps {
  task: AgentTask;
}

function formatElapsed(startedAt: string, completedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const seconds = ((end - start) / 1000).toFixed(1);
  return `${seconds}s`;
}

export function StepTrace({ task }: StepTraceProps) {
  const { steps, status, startedAt, completedAt, finalAnswer } = task;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length, status]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
              <ThinkingCard step={step} collapsed={i < steps.length - 1} />
            )}
            {step.type === 'tool-call' && (
              <ToolCallCard step={step} />
            )}
            {step.type === 'final-answer' && (
              <FinalAnswerCard step={step} priorSteps={steps.slice(0, i)} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

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
        />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
