import Dialog from "@mui/material/Dialog";
import { usePromptRunDetail } from "../../hooks/usePromptRunDetail";
import { DetailView } from "./DetailView";
import type { PromptGroup } from "./prompt-group";

export function RunDetailModal({
  taskId,
  group,
  onClose,
}: {
  taskId: string;
  group: PromptGroup;
  onClose: () => void;
}) {
  const { task, auditEvents, loading } = usePromptRunDetail(taskId);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "85vh", borderRadius: 2, overflow: "hidden" } }}
    >
      <DetailView
        group={group}
        task={task}
        auditEvents={auditEvents}
        loading={loading}
        onBack={onClose}
        variant="modal"
      />
    </Dialog>
  );
}
