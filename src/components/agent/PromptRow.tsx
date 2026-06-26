import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Person from "@mui/icons-material/Person";
import AccessTime from "@mui/icons-material/AccessTime";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Replay from "@mui/icons-material/Replay";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { relativeTime } from "../../lib/format-time";
import { memo } from "react";
import type { PromptGroup } from "./prompt-group";

function DecisionDot({ count, color, label }: { count: number; color: string; label: string }) {
  if (count === 0) return null;
  return (
    <Tooltip title={`${count} ${label}`}>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: 700, color }}>{count}</Typography>
      </Box>
    </Tooltip>
  );
}

export const PromptRow = memo(function PromptRow({
  group,
  onClick,
  onExport,
  onDelete,
  onRerun,
}: {
  group: PromptGroup;
  onClick: () => void;
  onExport: () => void;
  onDelete: () => void;
  onRerun: () => void;
}) {
  const timeLabel = relativeTime(group.timestamp);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1.5,
        py: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "rgba(99,102,241,0.08) !important" },
        borderBottom: 1,
        borderColor: "divider",
        transition: "none",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }} noWrap>
          {group.prompt}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Person sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {group.role}
          </Typography>
          <AccessTime sx={{ fontSize: 12, color: "text.disabled", ml: 0.25 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {timeLabel}
          </Typography>
          <DecisionDot count={group.allowCount} color="#22c55e" label="allowed" />
          <DecisionDot count={group.denyCount} color="#ef4444" label="denied" />
          <DecisionDot count={group.bypassedCount} color="#f59e0b" label="bypassed" />
          {group.status === "completed" && (
            <Tooltip title="Completed">
              <CheckCircleOutline sx={{ fontSize: 13, color: "success.main" }} />
            </Tooltip>
          )}
          {group.status === "failed" && (
            <Tooltip title="Stopped">
              <ErrorOutline sx={{ fontSize: 13, color: "error.main" }} />
            </Tooltip>
          )}
        </Box>
      </Box>
      <Tooltip title="Re-run with current role">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onRerun(); }}
          sx={{ flexShrink: 0, ml: 0.5 }}
        >
          <Replay sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export this run">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onExport(); }}
          sx={{ flexShrink: 0 }}
        >
          <FileDownloadOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete this run">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          sx={{ flexShrink: 0 }}
        >
          <DeleteOutline sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <ChevronRight sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }} />
    </Box>
  );
});
