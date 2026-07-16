"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dismissInstallPrompt,
  isBeforeInstallPromptEvent,
  isInstallDismissed,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa";
import { usePwaEnvironment } from "@/hooks/usePwaEnvironment";

interface InstallPromptProps {
  variant?: "card" | "settings";
  className?: string;
}

export function InstallPrompt({
  variant = "card",
  className,
}: InstallPromptProps) {
  const { ready, standalone, ios, android } = usePwaEnvironment();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setDismissed(isInstallDismissed());
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (isBeforeInstallPromptEvent(event)) {
        setDeferredPrompt(event);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      dismissInstallPrompt();
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    dismissInstallPrompt();
    setDismissed(true);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === "dismissed") {
        dismissInstallPrompt();
        setDismissed(true);
      }
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  if (!ready || standalone || dismissed) return null;

  const showAndroidInstall = Boolean(deferredPrompt) && (android || !ios);
  const showIosInstructions = ios && !standalone;
  const showDesktopInstall = Boolean(deferredPrompt) && !ios && !android;

  if (!showAndroidInstall && !showIosInstructions && !showDesktopInstall) {
    return null;
  }

  const isSettings = variant === "settings";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card",
        isSettings ? "p-6" : "p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2
              className={cn(
                "font-semibold text-foreground",
                isSettings ? "text-base" : "text-sm"
              )}
            >
              Install this app
            </h2>
            <p className="text-sm text-foreground-secondary mt-1">
              Add Level-Up to your home screen for a faster, app-style experience.
            </p>
          </div>
        </div>
        {!isSettings && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showIosInstructions && (
        <ol className="mt-4 space-y-2 text-sm text-foreground-secondary list-decimal list-inside">
          <li className="flex items-start gap-2">
            <Share className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Tap the Share button in Safari</span>
          </li>
          <li>Choose <span className="text-foreground">Add to Home Screen</span></li>
          <li>Tap <span className="text-foreground">Add</span></li>
        </ol>
      )}

      {(showAndroidInstall || showDesktopInstall) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors min-h-[44px]"
          >
            <Download className="h-4 w-4" />
            {installing ? "Installing..." : "Install app"}
          </button>
          {!isSettings && (
            <button
              type="button"
              onClick={handleDismiss}
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors min-h-[44px] px-2"
            >
              Not now
            </button>
          )}
        </div>
      )}

      {showIosInstructions && !isSettings && (
        <button
          type="button"
          onClick={handleDismiss}
          className="mt-4 text-sm text-foreground-secondary hover:text-foreground transition-colors min-h-[44px]"
        >
          Not now
        </button>
      )}
    </div>
  );
}
