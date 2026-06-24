import { useMemo, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditStream } from '../../hooks/useAuditStream';
import { useStore } from '../../lib/store';
import { AuditEventRow } from './AuditEventRow';

export function AuditLogPanel() {
  const { events: sseEvents, connected, clear: clearSSE } = useAuditStream();
  const storeEvents = useStore((s) => s.auditEvents);
  const [cleared, setCleared] = useState(false);

  const allEvents = useMemo(() => {
    if (cleared) return [];
    const seen = new Set<string>();
    const merged = [...storeEvents, ...sseEvents]
      .filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return merged;
  }, [sseEvents, storeEvents, cleared]);

  const handleClear = useCallback(() => {
    clearSSE();
    setCleared(true);
    setTimeout(() => setCleared(false), 100);
  }, [clearSSE]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, flexShrink: 0 }}>
        <FiberManualRecord sx={{ fontSize: 10, color: connected ? 'success.main' : 'text.disabled' }} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: connected ? 'success.main' : 'text.disabled' }}>
          {connected ? 'Live' : 'Connecting...'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {allEvents.length > 0 && (
          <>
            <Chip label={`${allEvents.length}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
            <Button size="small" onClick={handleClear} sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}>
              Clear
            </Button>
          </>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1, pb: 1 }}>
        {allEvents.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No audit events yet.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Run the AI assistant to see policy decisions here.
            </Typography>
          </Box>
        )}

        <AnimatePresence initial={false}>
          {allEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden', marginBottom: 4 }}
            >
              <AuditEventRow event={event} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
