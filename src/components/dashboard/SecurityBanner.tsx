import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useStore } from '../../lib/store';

export function SecurityBanner() {
  const securityEnabled = useStore((s) => s.securityEnabled);
  const toggleSecurity = useStore((s) => s.toggleSecurity);

  if (securityEnabled) return null;

  return (
    <Alert
      severity="error"
      variant="filled"
      sx={{ borderRadius: 0, py: 0.25 }}
      data-testid="security-banner"
      action={
        <Button color="inherit" size="small" onClick={toggleSecurity} data-testid="security-reenable">
          Re-enable
        </Button>
      }
    >
      POLICY ENGINE DISABLED — All MCP tool calls are bypassing security controls. This is for demo purposes only.
    </Alert>
  );
}
