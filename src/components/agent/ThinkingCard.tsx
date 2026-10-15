import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Psychology from '@mui/icons-material/Psychology';
import { CARD_SHADOW } from '../../lib/theme';
import type { AgentStep } from '../../types';

interface ThinkingCardProps {
  step: AgentStep;
}

export const ThinkingCard = memo(function ThinkingCard({ step }: ThinkingCardProps) {
  return (
    <Box sx={(t) => ({ border: 1, borderColor: 'divider', borderRadius: 1.5, bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#e8eaed', boxShadow: CARD_SHADOW })}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1 }}>
        <Psychology sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Step {step.stepNumber} · Thinking
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {step.content}
        </Typography>
      </Box>
    </Box>
  );
});
