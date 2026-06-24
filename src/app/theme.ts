"use client";

import { createTheme } from "@mui/material/styles";

// CSS-variable theme with light + dark color schemes. `colorSchemeSelector: "class"`
// pairs with <InitColorSchemeScript> in the layout to avoid a flash on load and to
// let the toggle switch schemes via useColorScheme().
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2563eb" },
        background: { default: "#f6f7f9", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#60a5fa" },
        background: { default: "#0b0d10", paper: "#15181d" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default theme;
