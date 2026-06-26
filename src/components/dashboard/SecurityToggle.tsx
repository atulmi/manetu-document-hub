import { useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { useStore } from '../../lib/store';

export function SecurityToggle() {
  const securityEnabled = useStore((s) => s.securityEnabled);
  const toggleSecurity = useStore((s) => s.toggleSecurity);
  const clearTask = useStore((s) => s.clearTask);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggle = () => {
    if (securityEnabled) {
      setDialogOpen(true);
    } else {
      toggleSecurity();
    }
  };

  const handleConfirm = () => {
    toggleSecurity();
    clearTask();
    setDialogOpen(false);
  };

  return (
    <>
      <FormControlLabel
        data-testid="security-toggle"
        control={
          <Switch
            checked={securityEnabled}
            onChange={handleToggle}
            color={securityEnabled ? 'success' : 'error'}
            size="small"
          />
        }
        label={securityEnabled ? 'Enabled' : 'Disabled'}
        slotProps={{
          typography: {
            variant: 'body2',
            sx: { fontWeight: 600, color: securityEnabled ? 'success.main' : 'error.main' },
          },
        }}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        data-testid="security-dialog"
        maxWidth="xs"
        fullWidth
        aria-labelledby="security-dialog-title"
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmber />
          <Typography id="security-dialog-title" variant="subtitle1" sx={{ fontWeight: 700 }}>
            Disable policy engine?
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <DialogContentText sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            This will allow <strong>all</strong> AI tool calls to execute without policy checks, regardless of the selected role.
            Access controls, sensitivity filters, and audit enforcement will be bypassed.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1.5, color: 'text.secondary', fontSize: '0.8rem' }}>
            This is for demonstration purposes only — to show the difference the Manetu Policy Engine makes.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            data-testid="security-dialog-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color="error"
            variant="outlined"
            data-testid="security-dialog-confirm"
          >
            Disable security
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
