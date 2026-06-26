import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FilterAltOff from "@mui/icons-material/FilterAltOff";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FileDownload from "@mui/icons-material/FileDownload";
import MoreVert from "@mui/icons-material/MoreVert";
import Replay from "@mui/icons-material/Replay";
import { useStore } from "../../lib/store";
import { exportSingleRun, exportFullReport } from "../../lib/export-txt";
import { relativeTime } from "../../lib/format-time";
import { ROLE_COLORS } from "../../lib/role-permissions";
import { ALL_ROLES } from "../../types";
import type { UserRole } from "../../types";
import type { PromptGroup } from "./prompt-group";
import { useState, useMemo, useEffect, useCallback } from "react";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "completed" | "failed";
type DecisionFilter = "all" | "allowed" | "denied" | "bypassed";

const cellSx = {
  py: 0.5,
  px: 1,
  fontSize: "0.75rem",
  borderColor: "divider",
} as const;
const headerSx = {
  ...cellSx,
  fontWeight: 700,
  fontSize: "0.65rem",
  color: "text.secondary",
  letterSpacing: "0.03em",
  textTransform: "uppercase" as const,
  bgcolor: (t: import("@mui/material").Theme) =>
    t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#f5f6f8",
} as const;
const chipSx = { height: 18, fontSize: "0.6rem" } as const;

export function ListView({
  groups,
  onSelect,
  onRerun,
  onClearAll,
}: {
  groups: PromptGroup[];
  onSelect: (taskId: string) => void;
  onRerun: (prompt: string) => void;
  onClearAll?: () => void;
}) {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      if (roleFilter !== "all" && g.role !== roleFilter) return false;
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (decisionFilter === "allowed" && g.allowCount === 0) return false;
      if (decisionFilter === "denied" && g.denyCount === 0) return false;
      if (decisionFilter === "bypassed" && g.bypassedCount === 0) return false;
      return true;
    });
  }, [groups, roleFilter, statusFilter, decisionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(0);
  }, [roleFilter, statusFilter, decisionFilter]);

  const hasActiveFilters =
    roleFilter !== "all" || statusFilter !== "all" || decisionFilter !== "all";

  const resetFilters = useCallback(() => {
    setRoleFilter("all");
    setStatusFilter("all");
    setDecisionFilter("all");
  }, []);

  if (groups.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          px: 3,
          gap: 1,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          No prompt runs yet
        </Typography>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ maxWidth: 320 }}
        >
          Submit a prompt in the Agent Task View. Each run will appear here —
          click to view the AI agent's reasoning steps, tool calls, and policy
          check results.
        </Typography>
      </Box>
    );
  }

  const selectSx = {
    minWidth: 100,
    ".MuiSelect-select": { py: 0.5, fontSize: "0.75rem" },
    bgcolor: "action.hover",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Filters */}
      <Box
        sx={{
          px: 1.5,
          mb: 1.5,
          mt: 1.5,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.65rem",
              display: "block",
              mb: 0.25,
            }}
          >
            User role
          </Typography>
          <FormControl size="small">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={selectSx}
              aria-label="Filter by user role"
            >
              <MenuItem value="all">All roles</MenuItem>
              {ALL_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.65rem",
              display: "block",
              mb: 0.25,
            }}
          >
            Job status
          </Typography>
          <FormControl size="small">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              sx={selectSx}
              aria-label="Filter by job status"
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Stopped</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.65rem",
              display: "block",
              mb: 0.25,
            }}
          >
            Policy decision
          </Typography>
          <FormControl size="small">
            <Select
              value={decisionFilter}
              aria-label="Filter by policy decision"
              onChange={(e) =>
                setDecisionFilter(e.target.value as DecisionFilter)
              }
              sx={selectSx}
            >
              <MenuItem value="all">All decisions</MenuItem>
              <MenuItem value="allowed">Has allowed</MenuItem>
              <MenuItem value="denied">Has denied</MenuItem>
              <MenuItem value="bypassed">Has bypassed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {hasActiveFilters && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: "0.65rem" }}
            >
              {filtered.length} of {groups.length}
            </Typography>
            <Button
              size="small"
              startIcon={<FilterAltOff sx={{ fontSize: 14 }} />}
              onClick={resetFilters}
              sx={{ fontSize: "0.65rem", minWidth: 0, textTransform: "none" }}
            >
              Reset
            </Button>
          </Box>
        )}
        {onClearAll && (
          <>
            <Box sx={{ flex: 1 }} />
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <MoreVert sx={{ fontSize: 18 }} />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  const { taskHistory, auditEvents } = useStore.getState();
                  exportFullReport(taskHistory, auditEvents);
                }}
              >
                <ListItemIcon>
                  <FileDownload fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export all prompt runs</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  onClearAll();
                }}
              >
                <ListItemIcon>
                  <DeleteOutline fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>
                  Clear all history
                </ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1, px: 1.5, py: 0.5 }}>
        {paged.length === 0 ? (
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
              No runs match the selected filters.
            </Typography>
            <Button
              size="small"
              startIcon={<FilterAltOff sx={{ fontSize: 14 }} />}
              onClick={resetFilters}
              sx={{ fontSize: "0.75rem" }}
            >
              Reset filters
            </Button>
          </Box>
        ) : (
          <Table
            size="small"
            stickyHeader
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              borderCollapse: "separate",
              overflow: "hidden",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={headerSx}>Prompt</TableCell>
                <TableCell sx={headerSx}>Role</TableCell>
                <TableCell sx={headerSx}>Decisions</TableCell>
                <TableCell sx={headerSx}>Status</TableCell>
                <TableCell sx={headerSx}>Time</TableCell>
                <TableCell sx={{ ...headerSx, textAlign: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((group) => {
                const roleColor =
                  ROLE_COLORS[group.role as UserRole] ?? "#6366f1";
                return (
                  <TableRow
                    key={group.taskId}
                    hover
                    onClick={() => onSelect(group.taskId)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "rgba(99,102,241,0.08) !important",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        ...cellSx,
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}
                    >
                      {group.prompt}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={group.role}
                        size="small"
                        variant="filled"
                        sx={{
                          ...chipSx,
                          fontWeight: 700,
                          bgcolor: roleColor,
                          color: "#fff",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {group.allowCount > 0 && (
                          <Chip
                            label={`${group.allowCount} allowed`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={chipSx}
                          />
                        )}
                        {group.denyCount > 0 && (
                          <Chip
                            label={`${group.denyCount} denied`}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={chipSx}
                          />
                        )}
                        {group.bypassedCount > 0 && (
                          <Chip
                            label={`${group.bypassedCount} bypassed`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={chipSx}
                          />
                        )}
                        {group.allowCount === 0 &&
                          group.denyCount === 0 &&
                          group.bypassedCount === 0 && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              —
                            </Typography>
                          )}
                      </Box>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {group.status === "completed" && (
                        <Chip
                          label="completed"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={chipSx}
                        />
                      )}
                      {group.status === "failed" && (
                        <Chip
                          label="stopped"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={chipSx}
                        />
                      )}
                      {group.status === "running" && (
                        <Chip
                          label="running"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={chipSx}
                        />
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        whiteSpace: "nowrap",
                        color: "text.secondary",
                      }}
                    >
                      {relativeTime(group.timestamp)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip title="Re-run with current role">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRerun(group.prompt);
                          }}
                        >
                          <Replay
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export this run">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const { taskHistory, auditEvents } =
                              useStore.getState();
                            const task = taskHistory.find(
                              (t) => t.id === group.taskId,
                            );
                            if (task) exportSingleRun(task, auditEvents);
                          }}
                        >
                          <FileDownloadOutlined
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete this run">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeleteId(group.taskId);
                          }}
                        >
                          <DeleteOutline
                            sx={{ fontSize: 16, color: "text.disabled" }}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination */}
      {groups.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 0.5,
            py: 0.75,
            px: 1,
            borderTop: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft sx={{ fontSize: 18 }} />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => (
            <Box
              key={i}
              onClick={() => setPage(i)}
              sx={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: page === i ? "primary.main" : "transparent",
                color: page === i ? "primary.contrastText" : "text.secondary",
                "&:hover": {
                  bgcolor:
                    page === i ? "primary.dark" : "rgba(99,102,241,0.15)",
                },
                transition: "none",
              }}
            >
              {i + 1}
            </Box>
          ))}
          <IconButton
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      {/* Delete dialog */}
      <Dialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="delete-run-dialog-title"
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <DeleteOutline />
          <Typography
            id="delete-run-dialog-title"
            variant="subtitle1"
            sx={{ fontWeight: 700 }}
          >
            Delete this prompt run?
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <DialogContentText sx={{ color: "text.primary", lineHeight: 1.7 }}>
            This will permanently delete this prompt run and its agent steps and
            policy checks.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPendingDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (pendingDeleteId)
                useStore.getState().deleteTaskById(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
