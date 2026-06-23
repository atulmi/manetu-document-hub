import Typography from '@mui/material/Typography';
import { AppShell } from '../components/dashboard/AppShell';
import { ThreePanel } from '../components/dashboard/ThreePanel';
import { DocLibrary } from '../components/docs/DocLibrary';

function Placeholder({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
      {text}
    </Typography>
  );
}

export function Dashboard() {
  return (
    <AppShell>
      <ThreePanel
        left={<DocLibrary />}
        center={<Placeholder text="Agent task view will appear here." />}
        right={<Placeholder text="Audit log will appear here." />}
      />
    </AppShell>
  );
}
