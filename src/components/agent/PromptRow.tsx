import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronRight from "@mui/icons-material/ChevronRight";
import MoreVert from "@mui/icons-material/MoreVert";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Replay from "@mui/icons-material/Replay";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { relativeTime } from "../../lib/format-time";
import { RoleBadge } from "../shared/RoleBadge";
import { memo, useState } from "react";
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1.5,
        py: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "rgba(29,78,216,0.08) !important" },
        borderBottom: 1,
        borderColor: "divider",
        transition: "none",
      }}
    >
      <RoleBadge role={group.role} />
      <Box sx={{ flex: 1, minWidth: 0, ml: 1.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }} noWrap>
          {group.prompt}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {group.role}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
            ·
          </Typography>
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
      <Tooltip title="More actions">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
          sx={{ flexShrink: 0, ml: 0.5 }}
        >
          <MoreVert sx={{ fontSize: 16, color: "text.disabled" }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => { closeMenu(); onRerun(); }}>
          <ListItemIcon>
            <Replay fontSize="small" />
          </ListItemIcon>
          <ListItemText>Re-run with current role</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { closeMenu(); onExport(); }}>
          <ListItemIcon>
            <FileDownloadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export this run</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { closeMenu(); onDelete(); }}>
          <ListItemIcon>
            <DeleteOutline fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <ChevronRight sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }} />
    </Box>
  );
});
