import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../../lib/theme';
import { useStore } from '../../lib/store';
import { SecurityToggle } from '../dashboard/SecurityToggle';
import { SecurityBanner } from '../dashboard/SecurityBanner';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

beforeEach(() => {
  useStore.setState({ securityEnabled: true, currentTask: null });
});

test('renders with security enabled by default', () => {
  render(<SecurityToggle />, { wrapper: Wrapper });
  expect(screen.getByText('Enabled')).toBeInTheDocument();
  expect(screen.getByRole('switch')).toBeChecked();
});

test('toggling off opens confirmation dialog', async () => {
  const user = userEvent.setup();
  render(<SecurityToggle />, { wrapper: Wrapper });

  await user.click(screen.getByRole('switch'));

  expect(screen.getByText('Disable policy engine?')).toBeInTheDocument();
  expect(screen.getByText(/all.*AI tool calls to execute without policy checks/)).toBeInTheDocument();
});

test('cancelling the dialog leaves security enabled', async () => {
  const user = userEvent.setup();
  render(<SecurityToggle />, { wrapper: Wrapper });

  await user.click(screen.getByRole('switch'));
  await user.click(screen.getByTestId('security-dialog-cancel'));

  expect(useStore.getState().securityEnabled).toBe(true);
  expect(screen.getByText('Enabled')).toBeInTheDocument();
});

test('confirming the dialog disables security', async () => {
  const user = userEvent.setup();
  render(<SecurityToggle />, { wrapper: Wrapper });

  await user.click(screen.getByRole('switch'));
  await user.click(screen.getByTestId('security-dialog-confirm'));

  expect(useStore.getState().securityEnabled).toBe(false);
  expect(screen.getByText('Disabled')).toBeInTheDocument();
});

test('toggle is disabled while agent task is running', () => {
  useStore.setState({
    currentTask: {
      id: 'test',
      prompt: 'test',
      role: 'viewer',
      status: 'running',
      steps: [],
      startedAt: new Date().toISOString(),
    },
  });
  render(<SecurityToggle />, { wrapper: Wrapper });
  expect(screen.getByRole('switch')).toBeDisabled();
});

test('toggling back on does not show dialog', async () => {
  useStore.setState({ securityEnabled: false });
  const user = userEvent.setup();
  render(<SecurityToggle />, { wrapper: Wrapper });

  expect(screen.getByText('Disabled')).toBeInTheDocument();
  await user.click(screen.getByRole('switch'));

  expect(useStore.getState().securityEnabled).toBe(true);
  expect(screen.queryByText('Disable policy engine?')).not.toBeInTheDocument();
});

test('banner shows when security is disabled', () => {
  useStore.setState({ securityEnabled: false });
  render(<SecurityBanner />, { wrapper: Wrapper });
  expect(screen.getByText(/POLICY ENGINE DISABLED/)).toBeInTheDocument();
});

test('banner is hidden when security is enabled', () => {
  render(<SecurityBanner />, { wrapper: Wrapper });
  expect(screen.queryByText(/POLICY ENGINE DISABLED/)).not.toBeInTheDocument();
});

test('banner re-enable button restores security without dialog', async () => {
  useStore.setState({ securityEnabled: false });
  const user = userEvent.setup();
  render(<SecurityBanner />, { wrapper: Wrapper });

  await user.click(screen.getByTestId('security-reenable'));

  expect(useStore.getState().securityEnabled).toBe(true);
  expect(screen.queryByText(/POLICY ENGINE DISABLED/)).not.toBeInTheDocument();
});
