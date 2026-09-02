import { useStore } from "../lib/store";
import { useAuditStream } from "./useAuditStream";
import { clearPromptHistory } from "../lib/prompt-history-api";
import { usePromptHistory } from "./usePromptHistory";

export function useAgentStepsHeader() {
  const { groups } = usePromptHistory();
  const setViewingTaskId = useStore((s) => s.setViewingTaskId);
  const { clear: clearSSE } = useAuditStream();

  const count = groups.length;

  const handleClear = () => {
    clearPromptHistory().catch((err) => console.error("Failed to clear prompt history:", err));
    clearSSE();
    setViewingTaskId(null);
  };

  const subtitle =
    count > 0 ? `${count} run${count !== 1 ? "s" : ""}` : undefined;

  return { count, subtitle, handleClear };
}
