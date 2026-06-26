import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Group, Panel, Separator } from "react-resizable-panels";
import { PanelHeader } from "./PanelHeader";

interface ThreePanelProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  rightTitle?: string;
  rightAction?: ReactNode;
}

function ResizeHandle() {
  return (
    <Separator aria-label="Resize panel">
      <Box
        role="separator"
        aria-orientation="vertical"
        sx={{
          width: 12,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "col-resize",
          "&:hover .resize-indicator, &[data-resize-handle-active] .resize-indicator":
            {
              opacity: 1,
            },
        }}
      >
        <Box
          className="resize-indicator"
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "primary.main",
            borderRadius: 1,
            px: 0,
            py: 0.25,
            opacity: 0.7,
            transition: "opacity 0.15s",
            zIndex: 1,
          }}
        >
          <ChevronLeft
            sx={{ fontSize: 14, color: "primary.contrastText", mx: -0.5 }}
          />
          <ChevronRight
            sx={{ fontSize: 14, color: "primary.contrastText", mx: -0.5 }}
          />
        </Box>
      </Box>
    </Separator>
  );
}

function PanelCard({
  title,
  subtitle,
  action,
  shadow,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  shadow?: string;
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
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        boxShadow:
          shadow ??
          "0 1px 1px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.16)",
      }}
    >
      <PanelHeader title={title} subtitle={subtitle} action={action} />
      <Box sx={{ flex: 1, overflow: "auto" }}>{children}</Box>
    </Box>
  );
}

export function ThreePanel({
  left,
  center,
  right,
  rightTitle,
  rightAction,
}: ThreePanelProps) {
  const theme = useTheme();
  const stacked = useMediaQuery(theme.breakpoints.down("md"));

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
        <Box sx={{ minHeight: 300 }}>
          <PanelCard title="Agent Task View">{center}</PanelCard>
        </Box>
        <Box sx={{ minHeight: 250 }}>
          <PanelCard
            title={rightTitle ?? "Prompt History"}
            action={rightAction}
          >
            {right}
          </PanelCard>
        </Box>
        <Box sx={{ minHeight: 300 }}>
          <PanelCard title="Document Library">{left}</PanelCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "hidden", p: 1 }}>
      <Group orientation="horizontal" style={{ height: "100%" }}>
        <Panel defaultSize="25%" minSize="20%">
          <Box sx={{ height: "100%", pr: 1, pl: 1, py: 1 }}>
            <PanelCard title="Document Library">{left}</PanelCard>
          </Box>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize="34%" minSize="25%">
          <Box sx={{ height: "100%", px: 1, py: 1 }}>
            <PanelCard title="Agent Task View">{center}</PanelCard>
          </Box>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize="33%" minSize="25%">
          <Box sx={{ height: "100%", pl: 1, pr: 1, py: 1 }}>
            <PanelCard
              title={rightTitle ?? "Prompt History"}
              action={rightAction}
            >
              {right}
            </PanelCard>
          </Box>
        </Panel>
      </Group>
    </Box>
  );
}
