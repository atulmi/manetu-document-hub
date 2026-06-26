import { useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './lib/theme';
import { useStore } from './lib/store';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

export function Root() {
  const themeMode = useStore((s) => s.themeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
