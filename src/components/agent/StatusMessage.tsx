import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import SmartToy from '@mui/icons-material/SmartToy';

interface StatusMessageProps {
  type: 'connecting' | 'running' | 'completed' | 'failed';
  message: string;
}

const ICON_MAP = {
  connecting: <CircularProgress size={14} sx={{ color: 'text.disabled' }} />,
  running: <CircularProgress size={14} sx={{ color: 'info.main' }} />,
  completed: <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />,
  failed: <Error sx={{ fontSize: 14, color: 'error.main' }} />,
};

const COLOR_MAP = {
  connecting: 'text.disabled',
  running: 'info.main',
  completed: 'success.main',
  failed: 'error.main',
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 0.5 }}>
      {type === 'connecting' ? <SmartToy sx={{ fontSize: 14, color: 'text.disabled' }} /> : ICON_MAP[type]}
      <Typography variant="caption" sx={{ color: COLOR_MAP[type], fontWeight: 500, fontSize: '0.75rem' }}>
        {message}
      </Typography>
    </Box>
  );
}
