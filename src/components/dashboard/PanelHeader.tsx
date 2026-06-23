import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface PanelHeaderProps {
  title: string;
}

export function PanelHeader({ title }: PanelHeaderProps) {
  return (
    <Box sx={{ flexShrink: 0, bgcolor: 'action.hover' }}>
      <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.primary', fontWeight: 600 }}>
        {title}
      </Typography>
      <Divider />
    </Box>
  );
}
