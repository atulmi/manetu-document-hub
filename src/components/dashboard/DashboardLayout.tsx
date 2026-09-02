import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMediaQuery, useTheme } from "@mui/material";
import { PANEL_SHADOW, TEAL_TEXT_LIGHT, TEAL_TEXT_DARK } from "../../lib/theme";

interface DashboardLayoutProps {
  main?: ReactNode;
  mainTitle?: string;
  tabs?: ReactNode;
  tabsHeader?: ReactNode;
}

const SIDEBAR_WIDTH = 420;

function SidebarCard({
  header,
  children,
}: {
  header?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid rgba(29,78,216,0.2)",
        borderRadius: 1.5,
        boxShadow: PANEL_SHADOW,
      }}
    >
      {header}
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>{children}</Box>
    </Box>
  );
}

export function DashboardLayout({
  main,
  mainTitle,
  tabs,
  tabsHeader,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const stacked = useMediaQuery(theme.breakpoints.down("md"));

  const mainArea = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          px: { xs: 1.5, sm: 2.5 },
          pt: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={(t) => ({
            color: t.palette.mode === "dark" ? TEAL_TEXT_DARK : TEAL_TEXT_LIGHT,
            fontWeight: 700,
            letterSpacing: "0.02em",
            fontSize: "1.05rem",
            mb: 1.5,
            flexShrink: 0,
          })}
        >
          {mainTitle ?? "Agent Task View"}
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0 }}>{main}</Box>
      </Box>
    </Box>
  );

  if (stacked) {
    return (
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box sx={{ minHeight: 300 }}>{mainArea}</Box>
        <Box sx={{ minHeight: 350 }}>
          <SidebarCard header={tabsHeader}>{tabs}</SidebarCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{ flex: 1, overflow: "hidden", display: "flex", gap: 1.5, p: 1.5 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{mainArea}</Box>
      <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
        <SidebarCard header={tabsHeader}>{tabs}</SidebarCard>
      </Box>
    </Box>
  );
}
