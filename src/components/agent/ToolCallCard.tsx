import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Build from '@mui/icons-material/Build';
import Lock from '@mui/icons-material/Lock';
import { PolicyDecisionBadge } from '../docs/PolicyDecisionBadge';
import { useStore } from '../../lib/store';
import type { AgentStep } from '../../types';

interface ToolCallCardProps {
  step: AgentStep;
}

export const ToolCallCard = memo(function ToolCallCard({ step }: ToolCallCardProps) {
  const selectDoc = useStore((s) => s.selectDoc);
  const tc = step.toolCall;
  if (!tc) return null;

  const denied = tc.policyDecision.decision === 'deny';
  const isReadFile = tc.toolName === 'read-file';
  const filePath = tc.args['path'] as string | undefined;

  const handleViewDoc = () => {
    if (filePath) {
      selectDoc({
        id: filePath.replace(/[/.]/g, '-'),
        title: filePath.split('/').pop() ?? filePath,
        path: filePath,
        sensitivity: filePath.startsWith('confidential') ? 'confidential' : filePath.startsWith('internal') ? 'internal' : 'public',
        excerpt: '',
        sizeBytes: 0,
      });
    }
  };

  return (
    <Box sx={{ border: 1, borderColor: denied ? 'error.main' : 'success.main', borderRadius: 1.5, borderLeftWidth: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1 }}>
        {denied ? <Lock sx={{ fontSize: 18, color: 'error.main' }} /> : <Build sx={{ fontSize: 18, color: 'text.secondary' }} />}
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Step {step.stepNumber} · Tool Call
        </Typography>
        <Box sx={{ flex: 1 }} />
        <PolicyDecisionBadge decision={tc.policyDecision.decision} />
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Row label="Tool" value={tc.toolName} />
        <Row label="MRN" value={tc.mrn} mono />
        <Row label="Args" value={JSON.stringify(tc.args)} mono />
        {tc.durationMs !== undefined && <Row label="Duration" value={`${tc.durationMs}ms`} />}
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 1 }}>
        {denied ? (
          <>
            <Row label="Rule" value={tc.policyDecision.rule ?? 'default-deny'} />
            <Typography variant="caption" color="error">
              Claude received: "{tc.error}"
            </Typography>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {tc.result ? `${JSON.stringify(tc.result).length.toLocaleString()} chars returned` : 'No result'}
            </Typography>
            {isReadFile && filePath && (
              <Button size="small" onClick={handleViewDoc} sx={{ ml: 'auto', fontSize: '0.7rem' }}>
                View Document →
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
});

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 60 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(mono && { fontFamily: 'monospace', fontSize: '0.7rem' }),
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
