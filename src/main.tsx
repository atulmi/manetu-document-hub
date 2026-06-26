import { StrictMode, useMemo, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import './index.css'
import { buildTheme } from './lib/theme'
import { useStore } from './lib/store'
import App from './App.tsx'

function Root() {
  const themeMode = useStore((s) => s.themeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
