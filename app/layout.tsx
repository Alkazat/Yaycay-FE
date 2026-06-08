import type { Metadata, Viewport } from "next";
// Design system: tokens + fonts + base, then component CSS (hoisted to avoid
// an SSR flash), then app-level styles.
import "../vendor/yaycay-ds/styles.css";
import "./ds-components.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Yaycay - For families making memories",
  description:
    "Plan the trip. Skip the stress. Keep the yay. A family holiday companion that builds the whole trip in one chat.",
  applicationName: "Yaycay",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Yaycay",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2A96D8",
  width: "device-width",
  initialScale: 1,
  // Required so iOS safe-area insets are honoured (touch hard-rule).
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
