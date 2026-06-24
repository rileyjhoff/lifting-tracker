"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setInfo("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, width: "100%", maxWidth: 400 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <FitnessCenterIcon color="primary" />
            <Typography variant="h6" component="h1">
              Lifting Tracker
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {mode === "signin"
              ? "Sign in to your workouts."
              : "Create an account to start tracking."}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                helperText={mode === "signup" ? "At least 6 characters." : undefined}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </Stack>
          </form>

          <Divider>or</Divider>

          <Button variant="outlined" size="large" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>

          <Typography variant="body2" align="center" sx={{ color: "text.secondary" }}>
            {mode === "signin" ? "No account yet? " : "Already have an account? "}
            <Link
              component="button"
              type="button"
              onClick={() => {
                setError(null);
                setInfo(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
