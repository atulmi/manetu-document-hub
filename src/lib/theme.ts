import { createTheme, type PaletteMode } from '@mui/material/styles';

export function buildTheme(mode: PaletteMode) {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: '#6366f1' },
      error:   { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      success: { main: '#22c55e' },
      ...(dark
        ? {
            background: { default: '#0a0b10', paper: '#1e2235' },
            divider: 'rgba(255,255,255,0.12)',
          }
        : {
            background: { default: '#f0f2f5', paper: '#ffffff' },
            divider: 'rgba(0,0,0,0.15)',
          }
      ),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
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
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#6366f1',
              color: '#fff',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(99,102,241,0.15)',
            },
            '&.Mui-selected:hover': {
              backgroundColor: '#6366f1',
              color: '#fff',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, minHeight: 36 },
          sizeSmall: { minHeight: 32 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { minWidth: 36, minHeight: 36 },
          sizeSmall: { minWidth: 32, minHeight: 32 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

export const theme = buildTheme('dark');
