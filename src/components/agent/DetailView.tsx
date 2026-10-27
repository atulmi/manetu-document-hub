import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SearchOff from "@mui/icons-material/SearchOff";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { EmptyState } from "../shared/EmptyState";
import { useStore } from "../../lib/store";
import { relativeTime } from "../../lib/format-time";
import { ROLE_COLORS } from "../../lib/role-permissions";
import { RolePermPopover } from "../shared/RolePermPopover";
import { RoleBadge } from "../shared/RoleBadge";
import { StepTrace } from "./StepTrace";
import { StepSidebar } from "./StepSidebar";
import { AuditEventRow } from "../audit/AuditEventRow";
import type { PromptGroup } from "./prompt-group";
import type { AuditEvent, UserRole } from "../../types";

export function DetailView({
  group,
  task,
  auditEvents,
  loading,
  onBack,
  variant = "panel",
}: {
  group: PromptGroup;
  task: ReturnType<typeof useStore.getState>["currentTask"];
  auditEvents: AuditEvent[];
  loading?: boolean;
  onBack: () => void;
  variant?: "panel" | "modal";
}) {
  const timeLabel = relativeTime(group.timestamp);
  const roleColor = ROLE_COLORS[group.role as UserRole] ?? "#1d4ed8";
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const isModal = variant === "modal";

  const countChips = (
    <>
      {group.allowCount > 0 && (
        <Chip
          label={`${group.allowCount} allowed`}
          size="small"
          color="success"
          variant="filled"
          sx={isModal ? undefined : { height: 18, fontSize: "0.6rem" }}
        />
      )}
      {group.denyCount > 0 && (
        <Chip
          label={`${group.denyCount} denied`}
          size="small"
          color="error"
          variant="filled"
          sx={isModal ? undefined : { height: 18, fontSize: "0.6rem" }}
        />
      )}
      {group.bypassedCount > 0 && (
        <Chip
          label={`${group.bypassedCount} bypassed`}
          size="small"
          color="warning"
          variant="filled"
          sx={isModal ? undefined : { height: 18, fontSize: "0.6rem" }}
        />
      )}
    </>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      {isModal ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            px: 3,
            py: 2,
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <IconButton
            size="small"
            onClick={onBack}
            sx={{ mt: 0.5 }}
            data-testid="run-detail-back-button"
          >
            <ArrowBack />
          </IconButton>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {group.prompt}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <RolePermPopover role={group.role as UserRole}>
                {(openPerms) => (
                  <Chip
                    label={group.role}
                    size="small"
                    variant="filled"
                    onClick={openPerms}
                    sx={{
                      fontWeight: 700,
                      bgcolor: roleColor,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  />
                )}
              </RolePermPopover>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {timeLabel}
              </Typography>
              {countChips}
            </Box>
          </Box>
        </Box>
      ) : (
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
          }}
        >
          <IconButton
            size="small"
            onClick={onBack}
            sx={{ mt: 0.25 }}
            data-testid="run-detail-back-button"
          >
            <ArrowBack sx={{ fontSize: 18 }} />
          </IconButton>
          <RoleBadge role={group.role} size={22} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {group.prompt}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                mt: 0.25,
                flexWrap: "wrap",
              }}
            >
              <RolePermPopover role={group.role as UserRole}>
                {(openPerms) => (
                  <Chip
                    label={group.role}
                    size="small"
                    variant="filled"
                    onClick={openPerms}
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      bgcolor: roleColor,
                      color: "#fff",
                      cursor: "pointer",
                    }}
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
              {countChips}
            </Box>
          </Box>
        </Box>
      )}

      {/* Step trace + policy checks */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {isModal && !loading && task && task.steps.length > 0 && (
          <StepSidebar steps={task.steps} />
        )}
        <Box sx={{ flex: 1, overflow: "auto", p: 2.5, pl: 6, pr: 6 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={24} />
            </Box>
          ) : task ? (
            <>
              <StepTrace task={task} />
              {auditEvents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    onClick={() => setAuditLogOpen((o) => !o)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      mb: auditLogOpen ? 0.5 : 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      Raw audit log ({auditEvents.length} check
                      {auditEvents.length !== 1 ? "s" : ""})
                    </Typography>
                    {auditLogOpen ? (
                      <ExpandLess
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    ) : (
                      <ExpandMore
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    )}
                  </Box>
                  <Collapse in={auditLogOpen}>
                    <Box
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      {auditEvents.map((event) => (
                        <AuditEventRow key={event.id} event={event} />
                      ))}
                    </Box>
                  </Collapse>
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
    </Box>
  );
}
