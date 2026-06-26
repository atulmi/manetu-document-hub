import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FilterAltOff from "@mui/icons-material/FilterAltOff";
import { useStore } from "../../lib/store";
import { exportSingleRun } from "../../lib/export-txt";
import { ALL_ROLES } from "../../types";
import { PromptRow } from "./PromptRow";
import type { PromptGroup } from "./prompt-group";
import { useState, useMemo, useEffect, useCallback } from "react";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "completed" | "failed";
type DecisionFilter = "all" | "allowed" | "denied" | "bypassed";

export function ListView({
  groups,
  onSelect,
  onRerun,
}: {
  groups: PromptGroup[];
  onSelect: (taskId: string) => void;
  onRerun: (prompt: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
          mb: 1,
          mt: 0.75,
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
      </Box>
      <Divider />
      {/* List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
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
          paged.map((group) => (
            <PromptRow
              key={group.taskId}
              group={group}
              onClick={() => onSelect(group.taskId)}
              onExport={() => {
                const { taskHistory, auditEvents } = useStore.getState();
                const task = taskHistory.find((t) => t.id === group.taskId);
                if (task) exportSingleRun(task, auditEvents);
              }}
              onDelete={() => setPendingDeleteId(group.taskId)}
              onRerun={() => onRerun(group.prompt)}
            />
          ))
        )}
      </Box>
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
