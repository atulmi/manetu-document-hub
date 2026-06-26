import { memo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Psychology from '@mui/icons-material/Psychology';
import { ROLE_COLORS } from '../../lib/role-permissions';
import type { AgentStep, UserRole } from '../../types';

interface ThinkingCardProps {
  step: AgentStep;
  role: UserRole;
  collapsed?: boolean;
}

export const ThinkingCard = memo(function ThinkingCard({ step, role, collapsed = false }: ThinkingCardProps) {
  const [expanded, setExpanded] = useState(!collapsed);
  const roleColor = ROLE_COLORS[role] ?? '#6366f1';

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
        <Chip
          label={role}
          size="small"
          variant="filled"
          sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, bgcolor: roleColor, color: '#fff' }}
        />
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
