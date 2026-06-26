import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PolicyDecisionBadge } from '../docs/PolicyDecisionBadge';
import type { AuditEvent } from '../../types';

interface AuditEventRowProps {
  event: AuditEvent;
}

export const AuditEventRow = memo(function AuditEventRow({ event }: AuditEventRowProps) {
  const toolName = event.resource.split(':').pop() ?? event.resource;
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <Box
      data-testid={`audit-event-${event.decision}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.15s',
      }}
    >
      <PolicyDecisionBadge decision={event.decision} size="sm" />
      <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
        {toolName}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }} noWrap>
        {event.resource}
      </Typography>
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', flexShrink: 0 }}>
        {event.principal}
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', fontFamily: 'monospace', flexShrink: 0 }}>
        {time}
      </Typography>
    </Box>
  );
});
