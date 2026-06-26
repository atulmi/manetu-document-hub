import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Replay from "@mui/icons-material/Replay";
import { useStore } from "../../lib/store";
import { relativeTime } from "../../lib/format-time";
import { StepTrace } from "./StepTrace";
import { AuditEventRow } from "../audit/AuditEventRow";
import type { PromptGroup } from "./prompt-group";

export function DetailView({
  group,
  task,
  onBack,
  onRerun,
}: {
  group: PromptGroup;
  task: ReturnType<typeof useStore.getState>["currentTask"];
  onBack: () => void;
  onRerun?: (prompt: string) => void;
}) {
  const timeLabel = relativeTime(group.timestamp);
  const isRunning = task?.status === "running";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          px: 1.5,
          py: 1,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: (t: import("@mui/material").Theme) =>
            t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "#e8eaed",
        }}
      >
        <IconButton size="small" onClick={onBack} sx={{ mt: 0.25 }}>
          <ArrowBack sx={{ fontSize: 18 }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {group.prompt}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {group.role} · {timeLabel}
            </Typography>
            {group.allowCount > 0 && (
              <Chip
                label={`${group.allowCount} allowed`}
                size="small"
                color="success"
                variant="filled"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
            {group.denyCount > 0 && (
              <Chip
                label={`${group.denyCount} denied`}
                size="small"
                color="error"
                variant="filled"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
            {group.bypassedCount > 0 && (
              <Chip
                label={`${group.bypassedCount} bypassed`}
                size="small"
                color="warning"
                variant="filled"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            )}
          </Box>
        </Box>
        {onRerun && !isRunning && (
          <Button
            size="small"
            startIcon={<Replay sx={{ fontSize: 14 }} />}
            onClick={() => onRerun(group.prompt)}
            sx={{ fontSize: "0.7rem", flexShrink: 0, mt: 0.25 }}
          >
            Re-run
          </Button>
        )}
      </Box>

      {/* Step trace + policy checks */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2.5 }}>
        {task ? (
          <>
            <StepTrace task={task} />
            {group.events.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  Policy checks ({group.events.length} total)
                </Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {group.events.map((event) => (
                    <AuditEventRow key={event.id} event={event} />
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Step details not available for this run.
            </Typography>
            {onRerun && (
              <Button
                size="small"
                startIcon={<Replay sx={{ fontSize: 14 }} />}
                onClick={() => onRerun(group.prompt)}
                sx={{ fontSize: "0.75rem" }}
              >
                Re-run this prompt
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
