import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useStore } from '../../lib/store';
import { StepTrace } from './StepTrace';

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);

  if (!currentTask) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No agent task running.
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
          Submit a prompt to see the agent's reasoning steps, tool calls, and policy decisions here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 1.5 }}>
      <StepTrace task={currentTask} />
    </Box>
  );
}
