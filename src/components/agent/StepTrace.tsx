import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentStep } from '../../types';
import { ThinkingCard } from './ThinkingCard';
import { ToolCallCard } from './ToolCallCard';
import { FinalAnswerCard } from './FinalAnswerCard';

interface StepTraceProps {
  steps: AgentStep[];
}

export function StepTrace({ steps }: StepTraceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <AnimatePresence initial={false}>
        {steps.map((step, i) => (
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
      <div ref={bottomRef} />
    </Box>
  );
}
