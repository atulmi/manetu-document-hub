import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Shield from "@mui/icons-material/Shield";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";
import { useStore } from "../../lib/store";
import { authEnabled } from "../../lib/supabase-client";
import { useAuthStore } from "../../lib/auth-store";
import { RoleSwitcher } from "./RoleSwitcher";
import { SecurityToggle } from "./SecurityToggle";
import { ROLE_PERMISSIONS } from "../../lib/role-permissions";
import { HEADER_TEAL, HEADER_TEAL_DARK, CARD_SHADOW } from "../../lib/theme";

export function Header() {
  const themeMode = useStore((s) => s.themeMode);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const activeRole = useStore((s) => s.activeRole);
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const [permAnchor, setPermAnchor] = useState<HTMLElement | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const perms = ROLE_PERMISSIONS[activeRole];

  return (
    <Box sx={{ flexShrink: 0 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={(t) => ({
          background: t.palette.mode === "dark" ? HEADER_TEAL_DARK : HEADER_TEAL,
        })}
      >
        <Toolbar variant="dense" sx={{ height: 40, minHeight: 40 }}>
          <Shield sx={{ mr: 1, fontSize: 20, color: "primary.contrastText" }} />
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: 700, fontSize: "0.9rem" }}
          >
            Manetu AI Document Hub
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {authEnabled && session && (
            <>
              <Button
                size="small"
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                startIcon={<Person sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: "none",
                  color: "primary.contrastText",
                  fontWeight: 600,
                  maxWidth: 220,
                }}
              >
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ fontWeight: 600, color: "inherit" }}
                >
                  {session.user.email}
                </Typography>
              </Button>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    setUserMenuAnchor(null);
                    signOut();
                  }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Log out</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box
        data-testid="header-controls"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2 },
          py: 0.75,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          boxShadow: CARD_SHADOW,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Tooltip
          title="Simulate different user roles to see how access policies change what the AI agent can do"
          arrow
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: "0.03em",
              cursor: "help",
            }}
          >
            Role
          </Typography>
        </Tooltip>
        <RoleSwitcher />
        <Tooltip title="View permissions for this role">
          <IconButton
            size="small"
            onClick={(e) => setPermAnchor(e.currentTarget)}
            sx={{ ml: -0.5 }}
          >
            <InfoOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(permAnchor)}
          anchorEl={permAnchor}
          onClose={() => setPermAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: { sx: { p: 2, maxWidth: 320, borderRadius: 2 } },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Permissions: {activeRole}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              display: "block",
              mb: 0.5,
            }}
          >
            Document access
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
              mb: 1.5,
            }}
          >
            {(Object.entries(perms.docs) as [string, boolean][]).map(
              ([tier, allowed]) => (
                <Box
                  key={tier}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {tier}
                  </Typography>
                  <Chip
                    label={allowed ? "Allowed" : "Denied"}
                    size="small"
                    color={allowed ? "success" : "error"}
                    variant="filled"
                    sx={{ height: 18, fontSize: "0.6rem", ml: "auto" }}
                  />
                </Box>
              ),
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              display: "block",
              mb: 0.5,
            }}
          >
            Tool access
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            {(Object.entries(perms.tools) as [string, boolean][]).map(
              ([tool, allowed]) => (
                <Box
                  key={tool}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                  >
                    {tool}
                  </Typography>
                  <Chip
                    label={allowed ? "Allowed" : "Denied"}
                    size="small"
                    color={allowed ? "success" : "error"}
                    variant="filled"
                    sx={{ height: 18, fontSize: "0.6rem", ml: "auto" }}
                  />
                </Box>
              ),
            )}
          </Box>
        </Popover>
        <Divider orientation="vertical" flexItem />
        <Tooltip
          title="Toggle the Policy Engine on or off to compare secured vs. unsecured AI agent behavior"
          arrow
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: "0.03em",
              cursor: "help",
            }}
          >
            Policy Engine
          </Typography>
        </Tooltip>
        <SecurityToggle />

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip
          title={
            themeMode === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          <IconButton
            onClick={toggleTheme}
            size="small"
            data-testid="theme-toggle"
          >
            {themeMode === "dark" ? (
              <LightMode fontSize="small" />
            ) : (
              <DarkMode fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
