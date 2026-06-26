import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';

const SHORTCUTS = [
  { keys: 'Enter', description: 'Submit prompt' },
  { keys: 'Shift + Enter', description: 'New line in prompt' },
  { keys: '?', description: 'Show keyboard shortcuts' },
  { keys: 'Esc', description: 'Close dialogs and modals' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="xs"
      fullWidth
      aria-labelledby="shortcuts-title"
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3, py: 1.5, display: 'flex', alignItems: 'center' }}>
        <Typography id="shortcuts-title" variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
          Keyboard shortcuts
        </Typography>
        <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        {SHORTCUTS.map((s) => (
          <Box key={s.keys} sx={{ display: 'flex', alignItems: 'center', px: 3, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {s.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {s.keys.split(' + ').map((k) => (
                <Box
                  key={k}
                  sx={{
                    px: 1,
                    py: 0.25,
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {k}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
