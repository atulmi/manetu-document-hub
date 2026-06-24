import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Shield from '@mui/icons-material/Shield';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import { useStore } from '../../lib/store';
import { RoleSwitcher } from './RoleSwitcher';
import { SecurityToggle } from './SecurityToggle';

export function Header() {
  const themeMode = useStore((s) => s.themeMode);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <Box sx={{ flexShrink: 0 }}>
      <AppBar position="static" elevation={0}>
        <Toolbar variant="dense" sx={{ height: 40, minHeight: 40 }}>
          <Shield sx={{ mr: 1, fontSize: 20, color: 'primary.contrastText' }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
            Manetu AI Document Hub
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        data-testid="header-controls"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 0.75,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Tooltip title="Simulate different user roles to see how access policies change what the AI agent can do" arrow>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.03em', cursor: 'help' }}>
            Role
          </Typography>
        </Tooltip>
        <RoleSwitcher />
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Toggle the Manetu Policy Engine on or off to compare secured vs. unsecured AI agent behavior" arrow>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.03em', cursor: 'help' }}>
            Manetu Policy Engine
          </Typography>
        </Tooltip>
        <SecurityToggle />

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleTheme} size="small" data-testid="theme-toggle">
            {themeMode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
