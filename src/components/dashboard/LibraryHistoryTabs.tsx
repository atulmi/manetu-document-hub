import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TEAL_TEXT_LIGHT, TEAL_TEXT_DARK } from '../../lib/theme';

interface LibraryHistoryTabsProps {
  value: 'library' | 'history';
  onChange: (value: 'library' | 'history') => void;
  historyLabel: string;
  action?: ReactNode;
}

export function LibraryHistoryTabs({ value, onChange, historyLabel, action }: LibraryHistoryTabsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Tabs
        value={value}
        onChange={(_, v: 'library' | 'history') => onChange(v)}
        variant="fullWidth"
        sx={(t) => ({
          flex: 1,
          minHeight: 44,
          '& .MuiTab-root': {
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.75rem',
            minHeight: 44,
            px: 1,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.15s',
          },
          '& .Mui-selected': {
            color: `${t.palette.mode === 'dark' ? TEAL_TEXT_DARK : TEAL_TEXT_LIGHT} !important`,
            fontWeight: 800,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: t.palette.mode === 'dark' ? TEAL_TEXT_DARK : TEAL_TEXT_LIGHT,
            height: 3,
          },
        })}
      >
        <Tab value="library" label="Document Library" />
        <Tab value="history" label={historyLabel} />
      </Tabs>
      {value === 'history' && action}
    </Box>
  );
}
