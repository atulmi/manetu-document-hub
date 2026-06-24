import Button from "@mui/material/Button";
import { AppShell } from "../components/dashboard/AppShell";
import { ThreePanel } from "../components/dashboard/ThreePanel";
import { DocLibrary } from "../components/docs/DocLibrary";
import { DocPreview } from "../components/docs/DocPreview";
import { AgentTaskPanel } from "../components/agent/AgentTaskPanel";
import { AgentStepsPanel, useAgentStepsHeader } from "../components/agent/AgentStepsPanel";
import { useStore } from "../lib/store";

export function Dashboard() {
  const selectDoc = useStore((s) => s.selectDoc);
  const { count, subtitle, handleClear } = useAgentStepsHeader();

  return (
    <AppShell>
      <ThreePanel
        left={<DocLibrary onSelectDoc={selectDoc} />}
        center={<AgentTaskPanel />}
        right={<AgentStepsPanel />}
        rightTitle={`Prompt History${subtitle ? ` (${subtitle})` : ""}`}
        rightAction={
          count > 0 ? (
            <Button
              size="small"
              onClick={handleClear}
              sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.7rem", minWidth: "auto", px: 1 }}
            >
              Clear
            </Button>
          ) : undefined
        }
      />
      <DocPreview />
    </AppShell>
  );
}
