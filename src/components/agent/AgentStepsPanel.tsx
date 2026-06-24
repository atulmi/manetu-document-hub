import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useStore } from '../../lib/store';
import { StepTrace } from './StepTrace';

export function AgentStepsPanel() {
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const viewingTaskId = useStore((s) => s.viewingTaskId);

  const viewingTask = viewingTaskId
    ? taskHistory.find((t) => t.id === viewingTaskId) ??
      (currentTask?.id === viewingTaskId ? currentTask : null)
    : null;

  const displayTask = viewingTask ?? currentTask;

  if (!displayTask) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {viewingTask && viewingTask !== currentTask && (
        <Box sx={{ px: 1.5, py: 0.75, bgcolor: 'action.hover', flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Viewing past task: "{displayTask.prompt}"
          </Typography>
        </Box>
      )}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        <StepTrace task={displayTask} />
      </Box>
    </Box>
  );
}
