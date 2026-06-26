import { memo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Psychology from '@mui/icons-material/Psychology';
import type { AgentStep } from '../../types';

interface ThinkingCardProps {
  step: AgentStep;
  collapsed?: boolean;
}

export const ThinkingCard = memo(function ThinkingCard({ step, collapsed = false }: ThinkingCardProps) {
  const [expanded, setExpanded] = useState(!collapsed);

  return (
    <Box sx={(t) => ({ border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' })}>
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, cursor: 'pointer' }}
      >
        <Psychology sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Step {step.stepNumber} · Thinking
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {step.content}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
});
