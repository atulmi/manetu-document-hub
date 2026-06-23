import Typography from '@mui/material/Typography';
import { AppShell } from '../components/dashboard/AppShell';
import { ThreePanel } from '../components/dashboard/ThreePanel';
import { DocLibrary } from '../components/docs/DocLibrary';
import { DocPreview } from '../components/docs/DocPreview';
import { AgentTaskPanel } from '../components/agent/AgentTaskPanel';
import { useStore } from '../lib/store';

function Placeholder({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
      {text}
    </Typography>
  );
}

export function Dashboard() {
  const selectDoc = useStore((s) => s.selectDoc);

  return (
    <AppShell>
      <ThreePanel
        left={<DocLibrary onSelectDoc={selectDoc} />}
        center={<AgentTaskPanel />}
        right={<Placeholder text="Audit log will appear here." />}
      />
      <DocPreview />
    </AppShell>
  );
}
