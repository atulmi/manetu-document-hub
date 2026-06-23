import { useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useStore } from '../../lib/store';
import type { UserRole } from '../../types';

const ROLES: { value: UserRole; label: string; dotColor: string }[] = [
  { value: 'viewer',       label: 'Viewer',        dotColor: '#29b6f6' },
  { value: 'developer',    label: 'Developer',     dotColor: '#6366f1' },
  { value: 'data-analyst', label: 'Data Analyst',  dotColor: '#6366f1' },
  { value: 'auditor',      label: 'Auditor',       dotColor: '#f59e0b' },
  { value: 'admin',        label: 'Admin',         dotColor: '#ef4444' },
];

function roleLabel(role: UserRole): string {
  return ROLES.find((r) => r.value === role)!.label;
}

export function RoleSwitcher() {
  const activeRole = useStore((s) => s.activeRole);
  const setRole = useStore((s) => s.setRole);
  const [toast, setToast] = useState(false);

  const handleChange = (e: SelectChangeEvent<UserRole>) => {
    const next = e.target.value as UserRole;
    if (next !== activeRole) {
      setRole(next);
      setToast(true);
    }
  };

  return (
    <>
      <FormControl size="small" data-testid="role-switcher">
        <Select<UserRole>
          value={activeRole}
          onChange={handleChange}
          variant="outlined"
          sx={{
            minWidth: 140,
            '.MuiSelect-select': { py: 0.5, display: 'flex', alignItems: 'center', gap: 1 },
          }}
          renderValue={(val) => {
            const r = ROLES.find((r) => r.value === val)!;
            return (
              <>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.dotColor, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
                  {r.label}
                </Typography>
              </>
            );
          }}
        >
          {ROLES.map((r, i) => (
            <MenuItem
              key={r.value}
              value={r.value}
              data-testid={`role-option-${r.value}`}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                ...(i > 0 && { borderTop: 1, borderColor: 'divider' }),
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.dotColor, flexShrink: 0 }} />
              <Typography variant="body2">{r.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Snackbar open={toast} autoHideDuration={2000} onClose={() => setToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setToast(false)}>
          Switched to {roleLabel(activeRole)} — refreshing access...
        </Alert>
      </Snackbar>
    </>
  );
}
