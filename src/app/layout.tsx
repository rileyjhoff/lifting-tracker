import type { Metadata, Viewport } from "next";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import Container from "@mui/material/Container";
import Providers from "./providers";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifting Tracker",
  description: "Plan and track your lifting workouts on a clean calendar.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Sets the color-scheme class before paint to avoid a flash. */}
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <Providers>
            <Header />
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
              {children}
            </Container>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
