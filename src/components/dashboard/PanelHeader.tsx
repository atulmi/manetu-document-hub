import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PanelHeader({ title, subtitle, action }: PanelHeaderProps) {
  return (
    <Box sx={(t) => ({
      flexShrink: 0,
      bgcolor: t.palette.mode === 'dark' ? 'rgba(99,102,241,0.35)' : '#8385f5',
    })}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, minHeight: 40 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', lineHeight: 1.2 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      <Divider />
    </Box>
  );
}
