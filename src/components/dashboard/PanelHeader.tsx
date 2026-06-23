import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface PanelHeaderProps {
  title: string;
}

export function PanelHeader({ title }: PanelHeaderProps) {
  return (
    <Box sx={{ flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
        {title}
      </Typography>
      <Divider />
    </Box>
  );
}
