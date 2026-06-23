import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Shield from '@mui/icons-material/Shield';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import { useStore } from '../../lib/store';
import { RoleSwitcher } from './RoleSwitcher';

export function Header() {
  const themeMode = useStore((s) => s.themeMode);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar variant="dense" sx={{ height: 56, minHeight: 56 }}>
        <Shield sx={{ mr: 1, color: 'primary.contrastText' }} />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '1rem' }}>
          AI Document Hub
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box data-testid="header-controls" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RoleSwitcher />
          <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleTheme} color="inherit" size="small" data-testid="theme-toggle">
              {themeMode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
