import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Send from "@mui/icons-material/Send";
import Stop from "@mui/icons-material/Stop";
import { useStore } from "../../lib/store";
import { useAgentRun } from "../../hooks/useAgentRun";

const SUGGESTIONS_PRIMARY = [
  "List all public documents available",
  "What documents discuss our security policy?",
  "Summarize the Q3 financial results",
  "What is the product roadmap for 2026?",
];

const SUGGESTIONS_SECONDARY = [
  "Read the board update from December",
  "Search for documents about hiring",
  "What compensation bands are available?",
  "Summarize the incident report from November",
];

const chipSx = {
  cursor: "pointer",
  fontSize: "0.75rem",
  "&:hover": {
    bgcolor: "rgba(99,102,241,0.12) !important",
    borderColor: "rgba(99,102,241,0.4) !important",
  },
} as const;

export function AgentTaskPanel() {
  const [prompt, setPrompt] = useState("");
  const { submit, stop, isRunning } = useAgentRun();
  const currentTask = useStore((s) => s.currentTask);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (wasRunning.current && !currentTask) {
      setPrompt("");
    }
    wasRunning.current = currentTask?.status === "running";
  }, [currentTask]);

  const displayPrompt = isRunning ? (currentTask?.prompt ?? prompt) : prompt;

  const handleSubmit = () => {
    const text = prompt.trim();
    if (!text || isRunning) return;
    submit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
      <Box sx={{ p: 2 }}>
        <TextField
          value={displayPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI assistant about your documents..."
          multiline
          minRows={6}
          maxRows={12}
          fullWidth
          disabled={isRunning}
          size="small"
          data-testid="agent-prompt-input"
          sx={{ mb: 1 }}
        />
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mb: 0.5, fontSize: "0.7rem" }}
        >
          Powered by Claude Sonnet 4.6 · Tool calls enforced by Manetu Policy Engine
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {isRunning ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Stop />}
              onClick={stop}
              data-testid="agent-stop-button"
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              data-testid="agent-submit-button"
            >
              Ask
            </Button>
          )}
          {isRunning && (
            <Chip
              label="running"
              size="small"
              color="info"
              variant="outlined"
              sx={{ ml: "auto", fontWeight: 600, fontSize: "0.7rem" }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Try asking:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {SUGGESTIONS_PRIMARY.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              variant="outlined"
              disabled={isRunning}
              onClick={() => setPrompt(s)}
              sx={isRunning ? { ...chipSx, cursor: "default" } : chipSx}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2.5, mb: 1, display: "block" }}>
          Or try these (may trigger policy denials depending on role):
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {SUGGESTIONS_SECONDARY.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              variant="outlined"
              disabled={isRunning}
              onClick={() => setPrompt(s)}
              sx={isRunning ? { ...chipSx, cursor: "default" } : chipSx}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
