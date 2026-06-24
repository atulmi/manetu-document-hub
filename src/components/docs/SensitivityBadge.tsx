import Chip from '@mui/material/Chip';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import LockIcon from '@mui/icons-material/Lock';
import type { DocSensitivity } from '../../types';

const CONFIG: Record<DocSensitivity, { color: 'success' | 'warning' | 'error'; label: string; Icon: typeof PublicIcon }> = {
  public:       { color: 'success', label: 'Public',       Icon: PublicIcon },
  internal:     { color: 'warning', label: 'Internal',     Icon: BusinessIcon },
  confidential: { color: 'error',   label: 'Confidential', Icon: LockIcon },
};

interface SensitivityBadgeProps {
  sensitivity: DocSensitivity;
  size?: 'sm' | 'md';
}

export function SensitivityBadge({ sensitivity, size = 'sm' }: SensitivityBadgeProps) {
  const { color, label, Icon } = CONFIG[sensitivity];
  return (
    <Chip
      icon={<Icon sx={{ fontSize: size === 'sm' ? 14 : 16 }} />}
      label={label}
      color={color}
      variant="filled"
      size="small"
      sx={{
        height: size === 'sm' ? 20 : 24,
        fontSize: size === 'sm' ? '0.65rem' : '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
      }}
    />
  );
}
