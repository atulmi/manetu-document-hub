import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import { ROLE_PERMISSIONS, ROLE_COLORS } from "../../lib/role-permissions";
import type { UserRole } from "../../types";
import type { ReactNode } from "react";

function PermIcon({ allowed }: { allowed: boolean }) {
  return allowed
    ? <Check sx={{ fontSize: 13, color: "success.main" }} />
    : <Close sx={{ fontSize: 13, color: "error.main" }} />;
}

interface RolePermPopoverProps {
  role: UserRole;
  children: (handleClick: (e: React.MouseEvent<HTMLElement>) => void) => ReactNode;
}

export function RolePermPopover({ role, children }: RolePermPopoverProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const perms = ROLE_PERMISSIONS[role];
  const color = ROLE_COLORS[role] ?? "#6366f1";

  return (
    <>
      {children((e) => { e.stopPropagation(); setAnchor(e.currentTarget); })}
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 1.5, maxWidth: 260, borderRadius: 1.5 } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {role}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.6rem", letterSpacing: "0.05em", display: "block", mb: 0.25 }}>
          DOCUMENT ACCESS
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.125, mb: 1 }}>
          {(Object.entries(perms.docs) as [string, boolean][]).map(([tier, allowed]) => (
            <Box key={tier} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <PermIcon allowed={allowed} />
              <Typography variant="caption" sx={{ flex: 1, textTransform: "capitalize", fontSize: "0.7rem" }}>{tier}</Typography>
              <Chip label={allowed ? "Allow" : "Deny"} size="small" color={allowed ? "success" : "error"} variant="filled" sx={{ height: 16, fontSize: "0.55rem" }} />
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.6rem", letterSpacing: "0.05em", display: "block", mb: 0.25 }}>
          TOOL ACCESS
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.125 }}>
          {(Object.entries(perms.tools) as [string, boolean][]).map(([tool, allowed]) => (
            <Box key={tool} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <PermIcon allowed={allowed} />
              <Typography variant="caption" sx={{ flex: 1, fontFamily: "monospace", fontSize: "0.65rem" }}>{tool}</Typography>
              <Chip label={allowed ? "Allow" : "Deny"} size="small" color={allowed ? "success" : "error"} variant="filled" sx={{ height: 16, fontSize: "0.55rem" }} />
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
