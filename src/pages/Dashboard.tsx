import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FileDownload from "@mui/icons-material/FileDownload";
import MoreVert from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import { AppShell } from "../components/dashboard/AppShell";
import { ThreePanel } from "../components/dashboard/ThreePanel";
import { DocLibrary } from "../components/docs/DocLibrary";
import { DocPreview } from "../components/docs/DocPreview";
import { AgentTaskPanel } from "../components/agent/AgentTaskPanel";
import {
  AgentStepsPanel,
  useAgentStepsHeader,
} from "../components/agent/AgentStepsPanel";
import { useStore } from "../lib/store";
import { exportFullReport } from "../lib/export-txt";

export function Dashboard() {
  const selectDoc = useStore((s) => s.selectDoc);
  const taskHistory = useStore((s) => s.taskHistory);
  const auditEvents = useStore((s) => s.auditEvents);
  const { count, subtitle, handleClear } = useAgentStepsHeader();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleConfirmClear = () => {
    handleClear();
    setConfirmOpen(false);
  };

  const handleExport = () => {
    setMenuAnchor(null);
    exportFullReport(taskHistory, auditEvents);
  };

  return (
    <AppShell>
      <ThreePanel
        left={<DocLibrary onSelectDoc={selectDoc} />}
        center={<AgentTaskPanel />}
        right={<AgentStepsPanel />}
        rightTitle={`Prompt History${subtitle ? ` (${subtitle})` : ""}`}
        rightAction={
          count > 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                <MoreVert sx={{ fontSize: 18 }} />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleExport}>
                  <ListItemIcon>
                    <FileDownload fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export all prompt runs</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    setConfirmOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <DeleteOutline fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText sx={{ color: "error.main" }}>
                    Clear all history
                  </ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : undefined
        }
      />
      <DocPreview />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <DeleteOutline />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Clear all history?
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <DialogContentText sx={{ color: "text.primary", lineHeight: 1.7 }}>
            This will permanently delete all {count} prompt run
            {count !== 1 ? "s" : ""}, including agent steps and audit events.
            This cannot be undone.
          </DialogContentText>
          <DialogContentText
            sx={{ mt: 1.5, color: "text.secondary", fontSize: "0.8rem" }}
          >
            Consider exporting your data first using the menu above.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="outlined" color="error" onClick={handleConfirmClear}>
            Clear history
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
