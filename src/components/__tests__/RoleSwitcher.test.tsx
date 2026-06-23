import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../../lib/theme';
import { useStore } from '../../lib/store';
import { RoleSwitcher } from '../dashboard/RoleSwitcher';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

beforeEach(() => {
  useStore.setState({ activeRole: 'viewer', currentTask: null, refetchTrigger: 0 });
});

test('renders with default role selected', () => {
  render(<RoleSwitcher />, { wrapper: Wrapper });
  expect(screen.getByText('Viewer')).toBeInTheDocument();
});

test('selecting a different role calls setRole', async () => {
  const user = userEvent.setup();
  render(<RoleSwitcher />, { wrapper: Wrapper });

  await user.click(screen.getByRole('combobox'));
  const listbox = within(screen.getByRole('listbox'));
  await user.click(listbox.getByText('Developer'));

  expect(useStore.getState().activeRole).toBe('developer');
});

test('selecting a role clears agent state and increments refetchTrigger', async () => {
  const user = userEvent.setup();
  render(<RoleSwitcher />, { wrapper: Wrapper });

  const before = useStore.getState().refetchTrigger;
  await user.click(screen.getByRole('combobox'));
  const listbox = within(screen.getByRole('listbox'));
  await user.click(listbox.getByText('Admin'));

  const state = useStore.getState();
  expect(state.activeRole).toBe('admin');
  expect(state.currentTask).toBeNull();
  expect(state.refetchTrigger).toBe(before + 1);
});

test('toast notification appears on role change', async () => {
  const user = userEvent.setup();
  render(<RoleSwitcher />, { wrapper: Wrapper });

  await user.click(screen.getByRole('combobox'));
  const listbox = within(screen.getByRole('listbox'));
  await user.click(listbox.getByText('Auditor'));

  expect(await screen.findByText(/Switched to Auditor/)).toBeInTheDocument();
});

test('displays role name for each role', () => {
  const { unmount } = render(<RoleSwitcher />, { wrapper: Wrapper });
  expect(screen.getByText('Viewer')).toBeInTheDocument();
  unmount();

  useStore.setState({ activeRole: 'admin' });
  render(<RoleSwitcher />, { wrapper: Wrapper });
  expect(screen.getByText('Admin')).toBeInTheDocument();
});
