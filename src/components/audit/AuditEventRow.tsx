import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { PolicyDecisionBadge } from '../docs/PolicyDecisionBadge';
import type { AuditEvent } from '../../types';

const BORDER_COLORS: Record<string, string> = {
  allow: 'success.main',
  deny: 'error.main',
  bypassed: 'warning.main',
};

interface AuditEventRowProps {
  event: AuditEvent;
}

export function AuditEventRow({ event }: AuditEventRowProps) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = BORDER_COLORS[event.decision] ?? 'divider';
  const toolName = event.resource.split(':').pop() ?? event.resource;
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <Box
      onClick={() => setExpanded((e) => !e)}
      data-testid={`audit-event-${event.decision}`}
      sx={{
        borderLeft: 4,
        borderColor,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: event.decision === 'bypassed' ? 'warning.main' : 'transparent',
        ...(event.decision === 'bypassed' && { bgcolor: 'rgba(245,158,11,0.08)' }),
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75 }}>
        <PolicyDecisionBadge decision={event.decision} size="sm" />
        <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }} noWrap>
          {toolName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {event.principal}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
          {time}
        </Typography>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <DetailRow label="Resource" value={event.resource} mono />
          <DetailRow label="Operation" value={event.operation} />
          {event.policyRule && <DetailRow label="Rule" value={event.policyRule} />}
          <DetailRow label="Task ID" value={event.agentTaskId} mono />
        </Box>
      </Collapse>
    </Box>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 65 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(mono && { fontFamily: 'monospace', fontSize: '0.65rem' }),
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
