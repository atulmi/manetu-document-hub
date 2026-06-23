import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Header } from './Header';
import { SecurityBanner } from './SecurityBanner';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      <SecurityBanner />
      {children}
    </Box>
  );
}
