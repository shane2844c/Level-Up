"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const isOffline = !navigator.onLine;
      setOffline(isOffline);
      setVisible(isOffline);
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!visible || !offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-[60] border-b border-warning/30 bg-card-elevated/95 backdrop-blur-sm safe-area-pt"
      )}
    >
      <div className="mx-auto flex max-w-content items-start gap-3 px-4 py-3 md:px-8">
        <WifiOff className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-foreground-secondary">
          You&apos;re offline. Your account data will be available again when
          your connection returns. Logging habits and syncing require an
          internet connection.
        </p>
      </div>
    </div>
  );
}
