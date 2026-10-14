import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { HEADER_TEAL, HEADER_TEAL_DARK } from "../../lib/theme";

export function RoleBadge({ role, size = 26 }: { role: string; size?: number }) {
  return (
    <Tooltip title={role}>
      <Box
        sx={(t) => ({
          width: size,
          height: size,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: t.palette.mode === "dark" ? HEADER_TEAL_DARK : HEADER_TEAL,
          color: "#fff",
          fontSize: size <= 22 ? "0.65rem" : "0.75rem",
          fontWeight: 700,
        })}
      >
        {role.charAt(0).toUpperCase()}
      </Box>
    </Tooltip>
  );
}
