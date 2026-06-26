import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Person from "@mui/icons-material/Person";
import AccessTime from "@mui/icons-material/AccessTime";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Replay from "@mui/icons-material/Replay";
import { relativeTime } from "../../lib/format-time";
import { memo } from "react";
import type { PromptGroup } from "./prompt-group";

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Person sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {group.role}
            </Typography>
            <AccessTime
              sx={{ fontSize: 12, color: "text.disabled", ml: 0.5 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {timeLabel}
            </Typography>
          </Box>
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
          {group.status === "failed" && (
            <Chip
              label="stopped"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {group.status === "completed" && (
            <Chip
              label="completed"
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
        </Box>
      </Box>
      <Tooltip title="Re-run with current role">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRerun();
          }}
          sx={{ flexShrink: 0, ml: 0.5 }}
        >
          <Replay sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export this run">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          sx={{ flexShrink: 0 }}
        >
          <FileDownloadOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete this run">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{ flexShrink: 0 }}
        >
          <DeleteOutline sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <ChevronRight
        sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }}
      />
    </Box>
  );
});
