import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { AgentStep } from "../../types";

const STEP_LABEL: Record<AgentStep["type"], string> = {
  thinking: "Thinking",
  "tool-call": "Tool Call",
  "final-answer": "Final Answer",
};

function stepColor(step: AgentStep): string {
  if (step.type === "tool-call") {
    return step.toolCall?.policyDecision.decision === "deny" ? "#ef4444" : "#22c55e";
  }
  // Gold, not green — this is just the agent's last word, not a "passed"
  // verdict like an allowed tool call, and green read as an extra success.
  if (step.type === "final-answer") return "#ca8a04";
  return "#9ca3af"; // thinking — neutral
}

// Thinking steps stay neutral (no verdict to show); tool calls and the
// final answer get a light tint of their dot color so pass/fail reads at
// a glance, not just from the small dot.
function stepTint(step: AgentStep): string | undefined {
  if (step.type === "thinking") return undefined;
  return stepColor(step);
}

export function StepSidebar({ steps }: { steps: AgentStep[] }) {
  const handleJump = (stepNumber: number) => {
    document
      .getElementById(`step-${stepNumber}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      sx={{
        width: 170,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        overflow: "auto",
        py: 1,
      }}
    >
      {steps.map((step, i) => {
        const tint = stepTint(step);
        return (
          <Box
            key={step.stepNumber}
            onClick={() => handleJump(step.stepNumber)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              cursor: "pointer",
              bgcolor: tint ? alpha(tint, 0.1) : undefined,
              ...(i > 0 && { borderTop: 1, borderColor: "divider" }),
              "&:hover": { bgcolor: tint ? alpha(tint, 0.18) : "action.hover" },
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: stepColor(step),
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, display: "block" }}>
                Step {step.stepNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: "block" }} noWrap>
                {STEP_LABEL[step.type]}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
