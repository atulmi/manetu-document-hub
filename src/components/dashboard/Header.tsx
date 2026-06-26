import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Chip from '@mui/material/Chip';
import Shield from '@mui/icons-material/Shield';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import { useStore } from '../../lib/store';
import { RoleSwitcher } from './RoleSwitcher';
import { SecurityToggle } from './SecurityToggle';
import type { UserRole } from '../../types';

interface RolePermissions {
  docs: { public: boolean; internal: boolean; confidential: boolean };
  tools: { 'list-directory': boolean; 'read-file': boolean; 'keyword-search': boolean };
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: {
    docs: { public: true, internal: false, confidential: false },
    tools: { 'list-directory': true, 'read-file': false, 'keyword-search': false },
  },
  developer: {
    docs: { public: true, internal: true, confidential: false },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': true },
  },
  'data-analyst': {
    docs: { public: true, internal: true, confidential: false },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': true },
  },
  auditor: {
    docs: { public: true, internal: true, confidential: true },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': false },
  },
  admin: {
    docs: { public: true, internal: true, confidential: true },
    tools: { 'list-directory': true, 'read-file': true, 'keyword-search': true },
  },
};

function PermIcon({ allowed }: { allowed: boolean }) {
  return allowed
    ? <Check sx={{ fontSize: 14, color: 'success.main' }} />
    : <Close sx={{ fontSize: 14, color: 'error.main' }} />;
}

export function Header() {
  const themeMode = useStore((s) => s.themeMode);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const activeRole = useStore((s) => s.activeRole);
  const [permAnchor, setPermAnchor] = useState<HTMLElement | null>(null);
  const perms = ROLE_PERMISSIONS[activeRole];

  return (
    <Box sx={{ flexShrink: 0 }}>
      <AppBar position="static" elevation={0} sx={(t) => ({ background: t.palette.mode === 'dark' ? 'linear-gradient(135deg, #1e2040 0%, #171930 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' })}>
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
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2 },
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
        <Tooltip title="View permissions for this role">
          <IconButton size="small" onClick={(e) => setPermAnchor(e.currentTarget)} sx={{ ml: -0.5 }}>
            <InfoOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(permAnchor)}
          anchorEl={permAnchor}
          onClose={() => setPermAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { p: 2, maxWidth: 320, borderRadius: 2 } } }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Permissions: {activeRole}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Document access
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mb: 1.5 }}>
            {(Object.entries(perms.docs) as [string, boolean][]).map(([tier, allowed]) => (
              <Box key={tier} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PermIcon allowed={allowed} />
                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{tier}</Typography>
                <Chip label={allowed ? 'Allowed' : 'Denied'} size="small" color={allowed ? 'success' : 'error'} variant="filled" sx={{ height: 18, fontSize: '0.6rem', ml: 'auto' }} />
              </Box>
            ))}
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Tool access
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {(Object.entries(perms.tools) as [string, boolean][]).map(([tool, allowed]) => (
              <Box key={tool} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PermIcon allowed={allowed} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{tool}</Typography>
                <Chip label={allowed ? 'Allowed' : 'Denied'} size="small" color={allowed ? 'success' : 'error'} variant="filled" sx={{ height: 18, fontSize: '0.6rem', ml: 'auto' }} />
              </Box>
            ))}
          </Box>
        </Popover>
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
