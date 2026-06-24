import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import Policy from '@mui/icons-material/Policy';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditStream } from '../../hooks/useAuditStream';
import { useStore } from '../../lib/store';
import { AuditEventRow } from './AuditEventRow';
import type { AuditEvent } from '../../types';

interface TaskGroup {
  taskId: string;
  prompt: string;
  events: AuditEvent[];
  allowCount: number;
  denyCount: number;
}

function AuditTaskAccordion({ group, isOpen, onToggle }: { group: TaskGroup; isOpen: boolean; onToggle: () => void }) {
  return (
    <Box sx={{ border: 1, borderColor: isOpen ? 'primary.main' : 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          cursor: 'pointer',
          bgcolor: isOpen ? 'primary.main' : 'action.hover',
          color: isOpen ? 'primary.contrastText' : 'text.primary',
          '&:hover': { bgcolor: isOpen ? 'primary.dark' : 'action.selected' },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          "{group.prompt}"
        </Typography>
        {group.allowCount > 0 && (
          <Chip label={`${group.allowCount} allowed`} size="small" color="success" variant="outlined"
            sx={{ height: 18, fontSize: '0.6rem', ...(isOpen && { borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }) }} />
        )}
        {group.denyCount > 0 && (
          <Chip label={`${group.denyCount} denied`} size="small" color="error" variant="outlined"
            sx={{ height: 18, fontSize: '0.6rem', ...(isOpen && { borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }) }} />
        )}
        {isOpen ? <ExpandLess sx={{ fontSize: 16, color: isOpen ? 'inherit' : 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />}
      </Box>
      <Collapse in={isOpen}>
        <Divider />
        {group.events.map((event) => (
          <AuditEventRow key={event.id} event={event} />
        ))}
      </Collapse>
    </Box>
  );
}

export function AuditLogPanel() {
  const { events: sseEvents, connected, clear: clearSSE } = useAuditStream();
  const storeEvents = useStore((s) => s.auditEvents);
  const auditPrompts = useStore((s) => s.auditPrompts);
  const clearAudit = useStore((s) => s.clearAudit);
  const viewingTaskId = useStore((s) => s.viewingTaskId);
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);

  const groups = useMemo(() => {
    const seen = new Set<string>();
    const allEvents = [...storeEvents, ...sseEvents]
      .filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const groupMap = new Map<string, TaskGroup>();
    for (const event of allEvents) {
      let group = groupMap.get(event.agentTaskId);
      if (!group) {
        group = {
          taskId: event.agentTaskId,
          prompt: auditPrompts[event.agentTaskId] ?? 'Unknown prompt',
          events: [],
          allowCount: 0,
          denyCount: 0,
        };
        groupMap.set(event.agentTaskId, group);
      }
      group.events.push(event);
      if (event.decision === 'allow' || event.decision === 'bypassed') group.allowCount++;
      if (event.decision === 'deny') group.denyCount++;
    }

    return [...groupMap.values()].reverse();
  }, [sseEvents, storeEvents, auditPrompts]);

  const totalEvents = groups.reduce((sum, g) => sum + g.events.length, 0);

  const handleClear = () => {
    clearSSE();
    clearAudit();
    setViewingTaskId(null);
  };

  const handleToggle = (taskId: string) => {
    setViewingTaskId(viewingTaskId === taskId ? null : taskId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, flexShrink: 0 }}>
        <Policy sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', lineHeight: 1.2 }}>
            Policy Audit Trail
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
            Policy checks for each AI agent prompt
          </Typography>
        </Box>
        <FiberManualRecord sx={{ fontSize: 8, color: connected ? 'success.main' : 'text.disabled' }} />
        {totalEvents > 0 && (
          <>
            <Chip label={`${totalEvents}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
            <Button size="small" onClick={handleClear} sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}>
              Clear
            </Button>
          </>
        )}
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {groups.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No audit events yet.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Each AI prompt will appear here with its policy allow/deny decisions.
            </Typography>
          </Box>
        )}

        <AnimatePresence initial={false}>
          {groups.map((group) => (
            <motion.div
              key={group.taskId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden', marginBottom: 8 }}
            >
              <AuditTaskAccordion
                group={group}
                isOpen={viewingTaskId === group.taskId}
                onToggle={() => handleToggle(group.taskId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
