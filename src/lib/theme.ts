import { createTheme, type PaletteMode } from '@mui/material/styles';

export function buildTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#6366f1' },
      error:   { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      success: { main: '#22c55e' },
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
}

export const theme = buildTheme('dark');
