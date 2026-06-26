import { AppShell } from "../components/dashboard/AppShell";
import { TwoPanel } from "../components/dashboard/ThreePanel";
import { DocLibrary } from "../components/docs/DocLibrary";
import { DocPreview } from "../components/docs/DocPreview";
import { CenterPanel } from "../components/agent/CenterPanel";
import { useStore } from "../lib/store";

export function Dashboard() {
  const selectDoc = useStore((s) => s.selectDoc);

  return (
    <AppShell>
      <TwoPanel
        left={<DocLibrary onSelectDoc={selectDoc} />}
        right={<CenterPanel />}
      />
      <DocPreview />
    </AppShell>
  );
}
