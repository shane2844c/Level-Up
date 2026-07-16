import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Level-Up",
  description: "Gamified habit tracking with XP rewards and category progression.",
  applicationName: "Level-Up",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Level-Up",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111315",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body className={`${inter.className} overflow-x-hidden`}>{children}</body>
    </html>
  );
}
