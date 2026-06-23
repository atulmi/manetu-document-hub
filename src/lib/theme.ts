import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },   // indigo
    error:   { main: '#ef4444' },   // red — DENIED / security-off
    warning: { main: '#f59e0b' },   // amber — BYPASSED
    success: { main: '#22c55e' },   // green — ALLOWED
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: '0.05em' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
