import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Send from '@mui/icons-material/Send';
import Stop from '@mui/icons-material/Stop';
import { useStore } from '../../lib/store';
import { useAgentRun } from '../../hooks/useAgentRun';
import { StepTrace } from './StepTrace';

const SUGGESTIONS = [
  'What documents discuss our security policy?',
  'Summarize the Q3 financial results',
  'What is the product roadmap for 2026?',
  'List all public documents available',
];

export function AgentTaskPanel() {
  const [prompt, setPrompt] = useState('');
  const { submit, stop, isRunning } = useAgentRun();
  const currentTask = useStore((s) => s.currentTask);

  const handleSubmit = () => {
    const text = prompt.trim();
    if (!text || isRunning) return;
    submit(text);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
        <TextField
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI assistant about your documents..."
          multiline
          minRows={2}
          maxRows={4}
          fullWidth
          disabled={isRunning}
          size="small"
          data-testid="agent-prompt-input"
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRunning ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Stop />}
              onClick={stop}
              data-testid="agent-stop-button"
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              data-testid="agent-submit-button"
            >
              Ask
            </Button>
          )}
          {currentTask && (
            <Chip
              label={currentTask.status}
              size="small"
              color={currentTask.status === 'completed' ? 'success' : currentTask.status === 'failed' ? 'error' : 'info'}
              variant="outlined"
              sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </Box>

      {!currentTask && (
        <Box sx={{ px: 2, pt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
            Try asking:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {SUGGESTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                onClick={() => setPrompt(s)}
                sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {currentTask && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
          <StepTrace steps={currentTask.steps} />
        </Box>
      )}
    </Box>
  );
}
