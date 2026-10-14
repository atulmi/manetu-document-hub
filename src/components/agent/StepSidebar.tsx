import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
  if (step.type === "final-answer") return "#22c55e";
  return "#9ca3af"; // thinking — neutral
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
        width: 150,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        overflow: "auto",
        py: 1,
      }}
    >
      {steps.map((step) => (
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
            "&:hover": { bgcolor: "action.hover" },
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
            <Typography variant="caption" sx={{ fontWeight: 600, display: "block", fontSize: "0.7rem" }}>
              Step {step.stepNumber}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.65rem", display: "block" }}
              noWrap
            >
              {STEP_LABEL[step.type]}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
