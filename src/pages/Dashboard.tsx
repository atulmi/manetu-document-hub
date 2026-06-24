import { AppShell } from "../components/dashboard/AppShell";
import { ThreePanel } from "../components/dashboard/ThreePanel";
import { DocLibrary } from "../components/docs/DocLibrary";
import { DocPreview } from "../components/docs/DocPreview";
import { AgentTaskPanel } from "../components/agent/AgentTaskPanel";
import { AgentStepsPanel } from "../components/agent/AgentStepsPanel";
import { useStore } from "../lib/store";

export function Dashboard() {
  const selectDoc = useStore((s) => s.selectDoc);

  return (
    <AppShell>
      <ThreePanel
        left={<DocLibrary onSelectDoc={selectDoc} />}
        center={<AgentTaskPanel />}
        right={<AgentStepsPanel />}
      />
      <DocPreview />
    </AppShell>
  );
}
