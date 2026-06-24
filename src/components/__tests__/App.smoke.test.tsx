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
  expect(screen.getByText('Manetu AI Document Hub')).toBeInTheDocument();
  expect(screen.getByText('Document Library')).toBeInTheDocument();
  expect(screen.getByText('Agent Task View')).toBeInTheDocument();
  expect(screen.getByText('Prompt History')).toBeInTheDocument();
});
