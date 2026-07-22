import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Jars",
  description: "Build your identity one coin at a time with visual habit jars.",
  applicationName: "Habit Jars",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habit Jars",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6366f1",
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
