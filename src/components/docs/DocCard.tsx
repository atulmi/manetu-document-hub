import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import Lock from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';
import { SensitivityBadge } from './SensitivityBadge';
import type { DocMeta } from '../../types';

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

  const card = (
    <motion.div
      layout
      animate={{ opacity: doc.accessible ? 1 : 0.45, filter: doc.accessible ? 'blur(0px)' : 'blur(0.5px)' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ButtonBase
        onClick={handleClick}
        sx={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          borderRadius: 1,
          p: 1,
          mb: 0.5,
          cursor: doc.accessible ? 'pointer' : 'not-allowed',
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
          <SensitivityBadge sensitivity={doc.sensitivity} />
        </Box>
      </ButtonBase>
    </motion.div>
  );

  if (!doc.accessible) {
    return (
      <Tooltip title={`Access restricted for current role`} arrow placement="right">
        {card}
      </Tooltip>
    );
  }

  return card;
}
