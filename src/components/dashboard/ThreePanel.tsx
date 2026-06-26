import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Group, Panel, Separator } from "react-resizable-panels";
import { PanelHeader } from "./PanelHeader";

interface TwoPanelProps {
  left?: ReactNode;
  right?: ReactNode;
  leftTitle?: string;
  rightTitle?: string;
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
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: "1px",
            bgcolor: "primary.main",
            opacity: 0.6,
            transform: "translateX(-50%)",
            transition: "opacity 0.15s, width 0.15s",
          },
          "&:hover::before, &[data-resize-handle-active]::before": {
            opacity: 1,
            width: "2px",
          },
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
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            px: 0,
            py: 0.25,
            opacity: 0.5,
            transition: "opacity 0.15s",
            zIndex: 1,
          }}
        >
          <ChevronLeft
            sx={{ fontSize: 14, color: "text.secondary", mx: -0.5 }}
          />
          <ChevronRight
            sx={{ fontSize: 14, color: "text.secondary", mx: -0.5 }}
          />
        </Box>
      </Box>
    </Separator>
  );
}

function PanelCard({
  title,
  children,
}: {
  title: string;
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
          "0 1px 1px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.16)",
      }}
    >
      <PanelHeader title={title} />
      <Box sx={{ flex: 1, overflow: "auto" }}>{children}</Box>
    </Box>
  );
}

export function TwoPanel({
  left,
  right,
  leftTitle,
  rightTitle,
}: TwoPanelProps) {
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
        <Box sx={{ minHeight: 400 }}>
          <PanelCard title={rightTitle ?? "Agent Task View"}>
            {right}
          </PanelCard>
        </Box>
        <Box sx={{ minHeight: 300 }}>
          <PanelCard title={leftTitle ?? "Document Library"}>
            {left}
          </PanelCard>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "hidden", p: 1 }}>
      <Group orientation="horizontal" style={{ height: "100%" }}>
        <Panel defaultSize="28%" minSize="18%">
          <Box sx={{ height: "100%", pr: 1.5, pl: 1, py: 1 }}>
            <PanelCard title={leftTitle ?? "Document Library"}>
              {left}
            </PanelCard>
          </Box>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize="72%" minSize="40%">
          <Box sx={{ height: "100%", pl: 1.5, pr: 1, py: 1 }}>
            <PanelCard title={rightTitle ?? "Agent Task View"}>
              {right}
            </PanelCard>
          </Box>
        </Panel>
      </Group>
    </Box>
  );
}
