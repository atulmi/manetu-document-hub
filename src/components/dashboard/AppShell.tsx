import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import WifiOff from '@mui/icons-material/WifiOff';
import { Header } from './Header';
import { SecurityBanner } from './SecurityBanner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const online = useOnlineStatus();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -9999,
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
            zIndex: 9999,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
          },
        }}
      >
        Skip to main content
      </Box>
      <Header />
      <SecurityBanner />
      {!online && (
        <Alert severity="warning" variant="filled" icon={<WifiOff />} sx={{ borderRadius: 0, py: 0.25 }}>
          You are offline. Some features may not work until your connection is restored.
        </Alert>
      )}
      <Box id="main-content" sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}
