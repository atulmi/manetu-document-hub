import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useDocLibrary } from '../../hooks/useDocLibrary';
import { useStore } from '../../lib/store';
import { DocFolder } from './DocFolder';
import { DocCard } from './DocCard';
import type { DocMeta, DocSensitivity } from '../../types';

const TIERS: DocSensitivity[] = ['public', 'internal', 'confidential'];

interface DocLibraryProps {
  onSelectDoc?: (doc: DocMeta) => void;
}

export function DocLibrary({ onSelectDoc }: DocLibraryProps) {
  const { docs, loading, error } = useDocLibrary();
  const activeRole = useStore((s) => s.activeRole);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSelect = useCallback((doc: DocMeta) => {
    setSelectedId(doc.id);
    onSelectDoc?.(doc);
  }, [onSelectDoc]);

  const handleLockedClick = useCallback((doc: DocMeta) => {
    setToast(`"${doc.title}" is restricted for the ${activeRole} role. Try switching to a higher-access role.`);
  }, [activeRole]);

  if (loading) {
    return (
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
          Unable to load documents
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        {TIERS.map((tier) => {
          const tierDocs = docs.filter((d) => d.sensitivity === tier);
          const accessibleCount = tierDocs.filter((d) => d.accessible).length;
          return (
            <DocFolder
              key={tier}
              sensitivity={tier}
              totalCount={tierDocs.length}
              accessibleCount={accessibleCount}
            >
              {tierDocs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  selected={selectedId === doc.id}
                  onSelect={handleSelect}
                  onLockedClick={handleLockedClick}
                />
              ))}
            </DocFolder>
          );
        })}
      </Box>

      <Snackbar
        open={toast !== null}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}
