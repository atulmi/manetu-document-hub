import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { authEnabled } from "../../lib/supabase-client";
import { useAuthStore } from "../../lib/auth-store";
import { LoginForm } from "./LoginForm";

/**
 * Renders children unchanged when Supabase isn't configured — a local
 * clone with just an ANTHROPIC_API_KEY keeps working with no login, same
 * as today. Only gates on a session when auth is actually turned on.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);

  if (!authEnabled) return <>{children}</>;

  if (initializing) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!session) return <LoginForm />;

  return <>{children}</>;
}
