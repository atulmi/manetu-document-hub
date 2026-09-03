import type { ReactNode } from "react";
import { Fragment } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useMediaQuery, useTheme } from "@mui/material";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useStore, type PanelKind } from "../../lib/store";
import { PANEL_SHADOW, TEAL_TEXT_LIGHT, TEAL_TEXT_DARK } from "../../lib/theme";

export interface PanelDescriptor {
  title: string;
  action?: ReactNode;
  content: ReactNode;
}

interface DashboardLayoutProps {
  panels: Record<PanelKind, PanelDescriptor>;
}

const DEFAULT_SIZE: Record<PanelKind, string> = {
  agent: "30%",
  library: "35%",
  history: "35%",
};
const MIN_SIZE: Record<PanelKind, string> = {
  agent: "20%",
  library: "22%",
  history: "22%",
};

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

function Card({
  title,
  action,
  canMoveBack,
  canMoveForward,
  onMoveBack,
  onMoveForward,
  stacked,
  children,
}: {
  title: string;
  action?: ReactNode;
  canMoveBack: boolean;
  canMoveForward: boolean;
  onMoveBack: () => void;
  onMoveForward: () => void;
  stacked: boolean;
  children?: ReactNode;
}) {
  const BackIcon = stacked ? KeyboardArrowUp : ChevronLeft;
  const ForwardIcon = stacked ? KeyboardArrowDown : ChevronRight;
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
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: { xs: 1.5, sm: 2 },
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
          sx={(t) => ({
            color: t.palette.mode === "dark" ? TEAL_TEXT_DARK : TEAL_TEXT_LIGHT,
            fontWeight: 700,
            letterSpacing: "0.02em",
            flex: 1,
            minWidth: 0,
          })}
        >
          {title}
        </Typography>
        {action}
        <Tooltip title={stacked ? "Move up" : "Move left"}>
          <span>
            <IconButton size="small" disabled={!canMoveBack} onClick={onMoveBack}>
              <BackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={stacked ? "Move down" : "Move right"}>
          <span>
            <IconButton size="small" disabled={!canMoveForward} onClick={onMoveForward}>
              <ForwardIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>{children}</Box>
    </Box>
  );
}

export function DashboardLayout({ panels }: DashboardLayoutProps) {
  const theme = useTheme();
  const stacked = useMediaQuery(theme.breakpoints.down("md"));
  const panelOrder = useStore((s) => s.panelOrder);
  const movePanel = useStore((s) => s.movePanel);

  const card = (kind: PanelKind, index: number) => (
    <Card
      title={panels[kind].title}
      action={panels[kind].action}
      stacked={stacked}
      canMoveBack={index > 0}
      canMoveForward={index < panelOrder.length - 1}
      onMoveBack={() => movePanel(kind, -1)}
      onMoveForward={() => movePanel(kind, 1)}
    >
      {panels[kind].content}
    </Card>
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
        {panelOrder.map((kind, index) => (
          <Box key={kind} sx={{ minHeight: 350 }}>
            {card(kind, index)}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "hidden", p: 1.5 }}>
      {/* Remount on reorder: the resize engine tracks panel sizes by mount
          order, so swapping positions resets to each panel's default size
          rather than risk misapplied widths from stale internal state. */}
      <Group key={panelOrder.join(",")} orientation="horizontal" style={{ height: "100%" }}>
        {panelOrder.map((kind, index) => (
          <Fragment key={kind}>
            {index > 0 && <ResizeHandle />}
            <Panel defaultSize={DEFAULT_SIZE[kind]} minSize={MIN_SIZE[kind]}>
              <Box sx={{ height: "100%", px: 0.75 }}>{card(kind, index)}</Box>
            </Panel>
          </Fragment>
        ))}
      </Group>
    </Box>
  );
}
