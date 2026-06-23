import Chip from '@mui/material/Chip';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import WarningAmber from '@mui/icons-material/WarningAmber';

type Decision = 'allow' | 'deny' | 'bypassed';

const CONFIG: Record<Decision, { color: 'success' | 'error' | 'warning'; label: string; Icon: typeof CheckCircle }> = {
  allow:    { color: 'success', label: 'ALLOWED',  Icon: CheckCircle },
  deny:     { color: 'error',   label: 'DENIED',   Icon: Cancel },
  bypassed: { color: 'warning', label: 'BYPASSED', Icon: WarningAmber },
};

interface PolicyDecisionBadgeProps {
  decision: Decision;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function PolicyDecisionBadge({ decision, size = 'sm', showIcon = true }: PolicyDecisionBadgeProps) {
  const { color, label, Icon } = CONFIG[decision];
  return (
    <Chip
      icon={showIcon ? <Icon sx={{ fontSize: size === 'sm' ? 14 : 16 }} /> : undefined}
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
