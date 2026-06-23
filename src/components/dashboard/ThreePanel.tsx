import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material';
import DragHandle from '@mui/icons-material/DragIndicator';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { PanelHeader } from './PanelHeader';

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
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'col-resize',
          borderLeft: 1,
          borderRight: 1,
          borderColor: 'divider',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: 'action.hover' },
          '&[data-resize-handle-active]': { bgcolor: 'action.selected' },
        }}
      >
        <DragHandle sx={{ fontSize: 14, color: 'text.disabled', transform: 'rotate(90deg)' }} />
      </Box>
    </Separator>
  );
}

function PanelSlot({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PanelHeader title={title} />
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

export function ThreePanel({ left, center, right }: ThreePanelProps) {
  const theme = useTheme();
  const stacked = useMediaQuery(theme.breakpoints.down('md'));

  if (stacked) {
    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <PanelSlot title="Document Library">{left}</PanelSlot>
        <PanelSlot title="Agent Task View">{center}</PanelSlot>
        <PanelSlot title="Audit Log">{right}</PanelSlot>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Group orientation="horizontal" style={{ height: '100%' }}>
        <Panel defaultSize="256px" minSize="180px" maxSize="400px">
          <PanelSlot title="Document Library">{left}</PanelSlot>
        </Panel>

        <ResizeHandle />

        <Panel minSize="300px">
          <PanelSlot title="Agent Task View">{center}</PanelSlot>
        </Panel>

        <ResizeHandle />

        <Panel defaultSize="320px" minSize="200px" maxSize="500px">
          <PanelSlot title="Audit Log">{right}</PanelSlot>
        </Panel>
      </Group>
    </Box>
  );
}
