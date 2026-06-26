import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Shield from "@mui/icons-material/Shield";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { useStore } from "../../lib/store";
import { ROLE_PERMISSIONS, ROLE_COLORS } from "../../lib/role-permissions";

const TIER_LABELS: Record<string, string> = {
  public: "Public",
  internal: "Internal",
  confidential: "Confidential",
};

const TOOL_LABELS: Record<string, string> = {
  "list-directory": "list-directory",
  "read-file": "read-file",
  "keyword-search": "keyword-search",
};

function PermRow({ label, allowed, mono }: { label: string; allowed: boolean; mono?: boolean }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.5,
        px: 1,
        borderRadius: 0.5,
      }}
    >
      {allowed ? (
        <Check sx={{ fontSize: 14, color: "success.main" }} />
      ) : (
        <Close sx={{ fontSize: 14, color: "error.main" }} />
      )}
      <Typography
        variant="caption"
        sx={{
          flex: 1,
          textTransform: mono ? "none" : "capitalize",
          ...(mono && { fontFamily: "monospace", fontSize: "0.7rem" }),
        }}
      >
        {label}
      </Typography>
      <Chip
        label={allowed ? "Allowed" : "Denied"}
        size="small"
        color={allowed ? "success" : "error"}
        variant="filled"
        sx={{ height: 18, fontSize: "0.6rem" }}
      />
    </Box>
  );
}

export function PolicyPanel() {
  const activeRole = useStore((s) => s.activeRole);
  const securityEnabled = useStore((s) => s.securityEnabled);
  const perms = ROLE_PERMISSIONS[activeRole];
  const roleColor = ROLE_COLORS[activeRole];

  if (!securityEnabled) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 1,
          px: 3,
          textAlign: "center",
        }}
      >
        <WarningAmber sx={{ fontSize: 32, color: "warning.main" }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Policy engine disabled
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 220 }}>
          All tool calls will bypass policy checks. Re-enable the Manetu Policy
          Engine to enforce access controls.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
      <Box sx={{ p: 1.5 }}>
        {/* Role badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Shield sx={{ fontSize: 16, color: "primary.main" }} />
          <Chip
            label={activeRole}
            size="small"
            variant="filled"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 700,
              bgcolor: roleColor,
              color: "#fff",
            }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Document access */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.05em", display: "block", mb: 0.5 }}
        >
          DOCUMENT ACCESS
        </Typography>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
          }}
        >
          {(Object.entries(perms.docs) as [string, boolean][]).map(([tier, allowed], i) => (
            <Box key={tier}>
              {i > 0 && <Divider />}
              <PermRow label={TIER_LABELS[tier] ?? tier} allowed={allowed} />
            </Box>
          ))}
        </Box>

        {/* Tool access */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.05em", display: "block", mb: 0.5 }}
        >
          TOOL ACCESS
        </Typography>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
            mb: 2,
          }}
        >
          {(Object.entries(perms.tools) as [string, boolean][]).map(([tool, allowed], i) => (
            <Box key={tool}>
              {i > 0 && <Divider />}
              <PermRow label={TOOL_LABELS[tool] ?? tool} allowed={allowed} mono />
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontSize: "0.65rem", lineHeight: 1.6, display: "block" }}
        >
          Policies are enforced by the Manetu Policy Engine (OPA). Switch roles
          in the controls bar to see how permissions change.
        </Typography>
      </Box>
    </Box>
  );
}
