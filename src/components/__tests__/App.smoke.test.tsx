import { render, screen } from '@testing-library/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../../lib/theme';
import App from '../../App';

test('renders without crashing', () => {
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>,
  );
  expect(screen.getByText('AI Document Hub')).toBeInTheDocument();
});
