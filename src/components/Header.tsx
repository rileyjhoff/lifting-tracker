"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { useColorScheme } from "@mui/material/styles";
import { signOut } from "@/app/auth/actions";

export default function Header({ userEmail }: { userEmail?: string }) {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const resolved = mode === "system" ? (systemMode ?? "light") : (mode ?? "light");
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar>
        <FitnessCenterIcon color="primary" sx={{ mr: 1.5 }} />
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          Lifting Tracker
        </Typography>

        {userEmail && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mr: 1, display: { xs: "none", sm: "block" } }}
          >
            {userEmail}
          </Typography>
        )}

        <Tooltip title={mounted ? `Switch to ${next} mode` : ""}>
          <span>
            <IconButton
              onClick={() => setMode(next)}
              aria-label="Toggle color mode"
              color="inherit"
            >
              {!mounted ? (
                <DarkModeIcon sx={{ opacity: 0 }} />
              ) : resolved === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <form action={signOut}>
          <Tooltip title="Sign out">
            <IconButton type="submit" aria-label="Sign out" color="inherit">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </form>
      </Toolbar>
    </AppBar>
  );
}
