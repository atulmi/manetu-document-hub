import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
import DragHandle from "@mui/icons-material/DragIndicator";
import { Group, Panel, Separator } from "react-resizable-panels";
import { PanelHeader } from "./PanelHeader";

interface ThreePanelProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

function ResizeHandle() {
  return (
    <Separator>
      <Box
        sx={{
          width: 8,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "col-resize",
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },
          "&[data-resize-handle-active]": { bgcolor: "action.selected" },
        }}
      >
        <DragHandle
          sx={{
            fontSize: 14,
            color: "text.disabled",
            transform: "rotate(90deg)",
          }}
        />
      </Box>
    </Separator>
  );
}

function PanelCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
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
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: 1.5,
        boxShadow: "0 4px 12px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.12)",
      }}
    >
      <PanelHeader title={title} subtitle={subtitle} />
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>{children}</Box>
    </Box>
  );
}

export function ThreePanel({ left, center, right }: ThreePanelProps) {
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
        <PanelCard title="Document Library">{left}</PanelCard>
        <PanelCard title="Agent Task View">{center}</PanelCard>
        <PanelCard title="Prompt History & Agent Steps">{right}</PanelCard>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "hidden", p: 1 }}>
      <Group orientation="horizontal" style={{ height: "100%" }}>
        <Panel defaultSize="256px" minSize="180px" maxSize="400px">
          <Box sx={{ height: "100%", pr: 0.5, pl: 0.5, py: 0.5 }}>
            <PanelCard title="Document Library">{left}</PanelCard>
          </Box>
        </Panel>

        <ResizeHandle />

        <Panel minSize="300px">
          <Box sx={{ height: "100%", px: 0.5, py: 0.5 }}>
            <PanelCard title="Agent Task View">{center}</PanelCard>
          </Box>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize="420px" minSize="280px" maxSize="600px">
          <Box sx={{ height: "100%", pl: 0.5, pr: 0.5, py: 0.5 }}>
            <PanelCard title="Prompt History & Agent Steps">{right}</PanelCard>
          </Box>
        </Panel>
      </Group>
    </Box>
  );
}
