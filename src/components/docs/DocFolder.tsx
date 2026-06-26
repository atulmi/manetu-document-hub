import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Public from '@mui/icons-material/Public';
import Business from '@mui/icons-material/Business';
import Lock from '@mui/icons-material/Lock';
import type { ReactNode } from 'react';
import type { DocSensitivity } from '../../types';

const FOLDER_ICONS: Record<DocSensitivity, typeof Public> = {
  public: Public,
  internal: Business,
  confidential: Lock,
};

const FOLDER_LABELS: Record<DocSensitivity, string> = {
  public: 'Public',
  internal: 'Internal',
  confidential: 'Confidential',
};


interface DocFolderProps {
  sensitivity: DocSensitivity;
  totalCount: number;
  accessibleCount: number;
  children: ReactNode;
}

export function DocFolder({ sensitivity, totalCount, accessibleCount, children }: DocFolderProps) {
  const [open, setOpen] = useState(true);
  const Icon = FOLDER_ICONS[sensitivity];
  const allLocked = accessibleCount === 0;

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          cursor: 'pointer',
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#d5d7da',
          '&:hover': { bgcolor: '#6366f1 !important', color: '#fff !important', '& *': { color: '#fff !important' } },
        }}
      >
        <Icon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
          {FOLDER_LABELS[sensitivity]}
        </Typography>
        {allLocked && <Lock sx={{ fontSize: 14, color: 'error.main' }} />}
        <Typography variant="caption" color={allLocked ? 'error.main' : 'text.secondary'}>
          {accessibleCount}/{totalCount}
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ pl: 1, pt: 0.5 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
