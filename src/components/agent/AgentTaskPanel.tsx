import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Send from '@mui/icons-material/Send';
import Stop from '@mui/icons-material/Stop';
import Replay from '@mui/icons-material/Replay';
import { useStore } from '../../lib/store';
import { useAgentRun } from '../../hooks/useAgentRun';
import { AuditLogPanel } from '../audit/AuditLogPanel';

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
  const clearTask = useStore((s) => s.clearTask);

  const displayPrompt = isRunning ? (currentTask?.prompt ?? prompt) : prompt;

  const handleSubmit = () => {
    const text = prompt.trim();
    if (!text || isRunning) return;
    submit(text);
  };

  const handleNewTask = () => {
    clearTask();
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
          value={displayPrompt}
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
          sx={{ mb: 0.5 }}
        />
        <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
          Powered by Claude Sonnet 4.6 · Tool calls enforced by Manetu Policy Engine
        </Typography>
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
            <>
              <Chip
                label={currentTask.status}
                size="small"
                color={currentTask.status === 'completed' ? 'success' : currentTask.status === 'failed' ? 'error' : 'info'}
                variant="outlined"
                sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.7rem' }}
              />
              {!isRunning && (
                <Button size="small" startIcon={<Replay />} onClick={handleNewTask}>
                  New task
                </Button>
              )}
            </>
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

      <Box sx={{ flex: 1, overflow: 'hidden', borderTop: 1, borderColor: 'divider', mt: 1 }}>
        <AuditLogPanel />
      </Box>
    </Box>
  );
}
