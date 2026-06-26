import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SearchOff from "@mui/icons-material/SearchOff";
import { EmptyState } from "../shared/EmptyState";
import { useStore } from "../../lib/store";
import { relativeTime } from "../../lib/format-time";
import { ROLE_COLORS } from "../../lib/role-permissions";
import { RolePermPopover } from "../shared/RolePermPopover";
import { StepTrace } from "./StepTrace";
import { AuditEventRow } from "../audit/AuditEventRow";
import type { PromptGroup } from "./prompt-group";
import type { UserRole } from "../../types";

export function DetailView({
  group,
  task,
  onBack,
}: {
  group: PromptGroup;
  task: ReturnType<typeof useStore.getState>["currentTask"];
  onBack: () => void;
}) {
  const timeLabel = relativeTime(group.timestamp);
  const roleColor = ROLE_COLORS[group.role as UserRole] ?? "#6366f1";

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
            <RolePermPopover role={group.role as UserRole}>
              {(openPerms) => (
                <Chip
                  label={group.role}
                  size="small"
                  variant="filled"
                  onClick={openPerms}
                  sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: roleColor, color: "#fff", cursor: "pointer" }}
                />
              )}
            </RolePermPopover>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {timeLabel}
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
          <EmptyState
            icon={<SearchOff sx={{ fontSize: 24 }} />}
            title="Step details not available"
            steps={[
              "This run may have been saved before step tracking was added",
              "Try re-running the same prompt to see full agent steps",
            ]}
          />
        )}
      </Box>
    </Box>
  );
}
