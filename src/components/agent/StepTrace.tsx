import { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Replay from "@mui/icons-material/Replay";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentStep, AgentTask } from "../../types";
import { ThinkingCard } from "./ThinkingCard";
import { ToolCallCard } from "./ToolCallCard";
import { FinalAnswerCard } from "./FinalAnswerCard";
import { StatusMessage } from "./StatusMessage";

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
  const { steps, status, startedAt, completedAt, finalAnswer } = task;
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevStepsLength = useRef(0);

  useEffect(() => {
    // A genuinely new task always starts from steps: [] — a drop in length
    // is the reliable signal for that, unlike task.id, which can legitimately
    // change mid-run (the client resyncs its temporary id to the server's
    // real one on the first audit event — see useAgentRun.ts) without this
    // being a new task. Relying on id here made a fast/batched run that
    // resyncs and finishes in the same render wrongly reset scroll to top.
    const isNewTask = steps.length < prevStepsLength.current;
    prevStepsLength.current = steps.length;
    if (isNewTask) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // Not gated on status === 'running': a batch of steps can arrive and
    // finish in the same render (e.g. a very fast run), in which case
    // 'running' is never individually observed but new content still
    // needs to be scrolled into view.
    const lastStep = steps[steps.length - 1];
    if (lastStep?.type === "final-answer") {
      // Land on the top of the final answer card, not the very bottom of
      // the page (past the "completed" status line) — the card itself is
      // what the user came here to read.
      document
        .getElementById(`step-${lastStep.stepNumber}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // steps.length (not steps itself) is the intended trigger: the array
    // gets a new reference on every append, which would otherwise re-run
    // this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, status]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div ref={topRef} />
      {status === "running" && steps.length === 0 && (
        <StatusMessage
          type="connecting"
          message="Connecting to Claude Sonnet 4.6..."
        />
      )}

      {status === "running" && steps.length > 0 && (
        <StatusMessage
          type="running"
          message={`Processing — ${steps.length} step${steps.length !== 1 ? "s" : ""} so far`}
        />
      )}

      <AnimatePresence initial={false}>
        {steps.map((step: AgentStep, i: number) => (
          <motion.div
            key={step.stepNumber}
            id={`step-${step.stepNumber}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {step.type === "thinking" && <ThinkingCard step={step} />}
            {step.type === "tool-call" && <ToolCallCard step={step} />}
            {step.type === "final-answer" && (
              <FinalAnswerCard step={step} priorSteps={steps.slice(0, i)} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {status === "running" && steps.length > 0 && (
        <StatusMessage
          type="running"
          message={`Processing — ${steps.length} step${steps.length !== 1 ? "s" : ""} so far`}
        />
      )}

      {status === "completed" && (
        <StatusMessage
          type="completed"
          message={`Agent completed in ${formatElapsed(startedAt, completedAt)}`}
        />
      )}

      {status === "failed" && (
        <StatusMessage
          type="failed"
          message={
            finalAnswer ??
            `Agent failed after ${formatElapsed(startedAt, completedAt)}`
          }
          action={
            onRetry ? (
              <Button
                size="small"
                startIcon={<Replay />}
                onClick={() => onRetry(task.prompt)}
                sx={{ fontSize: "0.7rem" }}
              >
                Retry
              </Button>
            ) : undefined
          }
        />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
