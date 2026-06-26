import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.65rem",
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.125,
        }}
      >
        {number}
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.8rem", lineHeight: 1.5 }}
      >
        {text}
      </Typography>
    </Box>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  steps?: string[];
  children?: ReactNode;
}

export function EmptyState({ icon, title, steps, children }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        px: 2.5,
        py: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: "text.disabled", display: "flex" }}>{icon}</Box>
        <Typography
          variant="body1"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          {title}
        </Typography>
      </Box>
      {steps && steps.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 0.5 }}>
          {steps.map((text, i) => (
            <StepItem key={i} number={i + 1} text={text} />
          ))}
        </Box>
      )}
      {children}
    </Box>
  );
}
