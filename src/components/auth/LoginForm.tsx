import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Shield from "@mui/icons-material/Shield";
import { useAuthStore } from "../../lib/auth-store";
import { HEADER_TEAL } from "../../lib/theme";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { signIn, signUp, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    if (mode === "signin") {
      await signIn(email, password);
    } else {
      const ok = await signUp(email, password);
      if (ok) {
        const hasSession = Boolean(useAuthStore.getState().session);
        setNotice(
          hasSession
            ? "Account created — you're signed in."
            : "Account created — check your email to confirm before signing in.",
        );
      }
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper elevation={0} sx={{ p: 4, width: 360, border: 1, borderColor: "divider", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Shield sx={{ color: HEADER_TEAL }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Manetu AI Document Hub
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {mode === "signin" ? "Sign in to use the agent." : "Create an account to use the agent."}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          {notice && <Alert severity="success">{notice}</Alert>}
          <Button type="submit" variant="contained" disabled={submitting}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <Button
            type="button"
            size="small"
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setNotice(null);
            }}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
