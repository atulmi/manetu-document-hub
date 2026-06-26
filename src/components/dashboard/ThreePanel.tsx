import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
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
            { opacity: 1 },
        }}
      >
        <Box
          className="resize-indicator"
          sx={{
            width: 4,
            height: 32,
            borderRadius: 2,
            bgcolor: "primary.main",
            opacity: 0,
            transition: "opacity 0.15s",
          }}
        />
      </Box>
    </Separator>
  );
}

function PanelCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
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
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 1.5,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <PanelHeader title={title} subtitle={subtitle} action={action} />
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>{children}</Box>
      <Box
        sx={{
          height: 5,
          bgcolor: "primary.main",
          flexShrink: 0,
          borderRadius: "0 0 6px 6px",
        }}
      />
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

        <Panel defaultSize="45%" minSize="25%">
          <Box sx={{ height: "100%", px: 1, py: 1 }}>
            <PanelCard title="Agent Task View">{center}</PanelCard>
          </Box>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize="30%" minSize="20%">
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
