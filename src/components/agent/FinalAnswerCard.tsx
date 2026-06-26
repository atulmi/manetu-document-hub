import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AgentStep } from '../../types';
import type { Components } from 'react-markdown';

const mdComponents: Components = {
  h1: ({ children }) => <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>{children}</Typography>,
  h2: ({ children }) => <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>{children}</Typography>,
  p: ({ children }) => <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>{children}</Typography>,
  li: ({ children }) => <Typography component="li" variant="body2" sx={{ mb: 0.25, lineHeight: 1.7 }}>{children}</Typography>,
  strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,
};

interface FinalAnswerCardProps {
  step: AgentStep;
  priorSteps: AgentStep[];
}

export function FinalAnswerCard({ step, priorSteps }: FinalAnswerCardProps) {
  const sources = priorSteps
    .filter((s) => s.type === 'tool-call' && s.toolCall?.toolName === 'read-file' && s.toolCall.policyDecision.decision === 'allow')
    .map((s) => s.toolCall!.args['path'] as string);

  return (
    <Box sx={{ border: 1, borderColor: 'success.main', borderRadius: 1.5, borderLeftWidth: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1 }}>
        <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Final Answer
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {step.content}
        </ReactMarkdown>
      </Box>
      {sources.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 1.5, py: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Sources consulted:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {sources.map((src) => (
                <Chip key={src} label={src} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
