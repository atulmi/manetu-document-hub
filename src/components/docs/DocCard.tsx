import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ButtonBase from '@mui/material/ButtonBase';
import Lock from '@mui/icons-material/Lock';
import type { DocMeta, DocSensitivity } from '../../types';

const SENSITIVITY_COLORS: Record<DocSensitivity, 'success' | 'warning' | 'error'> = {
  public: 'success',
  internal: 'warning',
  confidential: 'error',
};

interface DocCardProps {
  doc: DocMeta & { accessible: boolean };
  selected: boolean;
  onSelect: (doc: DocMeta) => void;
  onLockedClick: (doc: DocMeta) => void;
}

export function DocCard({ doc, selected, onSelect, onLockedClick }: DocCardProps) {
  const handleClick = () => {
    if (doc.accessible) {
      onSelect(doc);
    } else {
      onLockedClick(doc);
    }
  };

  return (
    <ButtonBase
      onClick={handleClick}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 1,
        p: 1,
        mb: 0.5,
        opacity: doc.accessible ? 1 : 0.5,
        bgcolor: selected ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
        transition: 'background-color 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
          {doc.title}
        </Typography>
        {!doc.accessible && <Lock sx={{ fontSize: 14, color: 'text.disabled' }} />}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}
      >
        {doc.excerpt}
      </Typography>
      <Box sx={{ mt: 0.5 }}>
        <Chip
          label={doc.sensitivity}
          size="small"
          color={SENSITIVITY_COLORS[doc.sensitivity]}
          variant="filled"
          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
        />
      </Box>
    </ButtonBase>
  );
}
