import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 safe-area-pt safe-area-pb">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15">
          <WifiOff className="h-7 w-7 text-warning" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          You&apos;re offline
        </h1>
        <p className="text-sm text-foreground-secondary mb-6">
          Level-Up needs an internet connection to load your account data and
          sync habit logs. Reconnect and try again.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors min-h-[44px]"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
