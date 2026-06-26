import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import SmartToy from '@mui/icons-material/SmartToy';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';

interface StatusMessageProps {
  type: 'connecting' | 'running' | 'completed' | 'failed';
  message: string;
  action?: ReactNode;
}

const COLOR_MAP = {
  connecting: 'text.disabled',
  running: 'info.main',
  completed: 'success.main',
  failed: 'error.main',
};

function StatusIcon({ type }: { type: StatusMessageProps['type'] }) {
  if (type === 'connecting') {
    return <SmartToy sx={{ fontSize: 14, color: 'text.disabled', animation: 'pulse 1.5s ease-in-out infinite' }} />;
  }
  if (type === 'running') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <CircularProgress size={14} sx={{ color: 'info.main' }} />
        <FiberManualRecord sx={{
          fontSize: 6,
          color: 'info.main',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 1s ease-in-out infinite',
        }} />
      </Box>
    );
  }
  if (type === 'completed') {
    return <CheckCircle sx={{
      fontSize: 14,
      color: 'success.main',
      animation: 'scaleIn 0.3s ease-out',
      '@keyframes scaleIn': {
        '0%': { transform: 'scale(0)' },
        '60%': { transform: 'scale(1.2)' },
        '100%': { transform: 'scale(1)' },
      },
    }} />;
  }
  return <Error sx={{ fontSize: 14, color: 'error.main' }} />;
}

export function StatusMessage({ type, message, action }: StatusMessageProps) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      py: 0.75,
      px: 0.5,
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.4 },
      },
    }}>
      <StatusIcon type={type} />
      <Typography variant="caption" sx={{ color: COLOR_MAP[type], fontWeight: 500, fontSize: '0.75rem', flex: 1 }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}
