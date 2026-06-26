import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Close from '@mui/icons-material/Close';
import Description from '@mui/icons-material/Description';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../../lib/store';
import { useDocContent } from '../../hooks/useDocContent';
import { SensitivityBadge } from './SensitivityBadge';
import type { Components } from 'react-markdown';

const mdComponents: Components = {
  h1: ({ children }) => <Typography variant="h5" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>{children}</Typography>,
  h2: ({ children }) => <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>{children}</Typography>,
  h3: ({ children }) => <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1.5, mb: 0.5 }}>{children}</Typography>,
  p: ({ children }) => <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>{children}</Typography>,
  li: ({ children }) => <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.7 }}>{children}</Typography>,
  hr: () => <Box component="hr" sx={{ border: 'none', borderTop: 1, borderColor: 'divider', my: 2 }} />,
  table: ({ children }) => (
    <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', my: 1.5, fontSize: '0.8rem' }}>
      {children}
    </Box>
  ),
  th: ({ children }) => (
    <Box component="th" sx={{ border: 1, borderColor: 'divider', px: 1, py: 0.5, fontWeight: 600, textAlign: 'left', bgcolor: 'action.hover' }}>
      {children}
    </Box>
  ),
  td: ({ children }) => (
    <Box component="td" sx={{ border: 1, borderColor: 'divider', px: 1, py: 0.5 }}>
      {children}
    </Box>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <Box component="pre" sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5, overflow: 'auto', my: 1.5 }}>
          <Box component="code" sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{children}</Box>
        </Box>
      );
    }
    return (
      <Box component="code" sx={{ bgcolor: 'action.hover', borderRadius: 0.5, px: 0.5, fontSize: '0.8rem', fontFamily: 'monospace' }}>
        {children}
      </Box>
    );
  },
  blockquote: ({ children }) => (
    <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2, my: 1.5, color: 'text.secondary' }}>
      {children}
    </Box>
  ),
  strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,
};

export function DocPreview() {
  const selectedDoc = useStore((s) => s.selectedDoc);
  const selectDoc = useStore((s) => s.selectDoc);
  const { content, loading, error } = useDocContent(selectedDoc?.path ?? null);

  const handleClose = () => selectDoc(null);

  return (
    <Dialog
      open={selectedDoc !== null}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="doc-preview-title"
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden', maxHeight: '85vh' } }}
    >
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Description />
        <Typography id="doc-preview-title" variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }} noWrap>
          {selectedDoc?.title}
        </Typography>
        {selectedDoc && <SensitivityBadge sensitivity={selectedDoc.sensitivity} />}
        <IconButton onClick={handleClose} size="small" sx={{ color: 'inherit', ml: 1 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 1 }} />
          </Box>
        )}

        {error && (
          <Box>
            <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>Access restricted</Typography>
            <Typography variant="caption" color="text.secondary">{error}</Typography>
          </Box>
        )}

        {content && !loading && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        )}
      </DialogContent>
    </Dialog>
  );
}
