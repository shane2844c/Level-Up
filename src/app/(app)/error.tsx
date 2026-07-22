"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Database, ExternalLink } from "lucide-react";
import { isMissingTableError, isAuthSessionError } from "@/lib/errors";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const needsMigration =
    error.message.includes("Database tables are not set up") ||
    error.message.includes("Progress tables are not set up") ||
    error.message.includes("Could not find the table") ||
    isMissingTableError(error);

  const sessionExpired =
    isAuthSessionError(error) ||
    error.message.includes("Your session has expired");

  const migrationFile = error.message.includes("002_progress_level_events")
    ? "supabase/migrations/002_progress_level_events.sql"
    : "supabase/migrations/001_initial_schema.sql";

  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-negative/15 mb-6">
        {needsMigration ? (
          <Database className="h-7 w-7 text-primary" />
        ) : (
          <AlertTriangle className="h-7 w-7 text-negative" />
        )}
      </div>

      <h1 className="text-xl font-semibold text-foreground mb-2">
        {needsMigration
          ? "Database setup required"
          : sessionExpired
            ? "Session expired"
            : "Something went wrong"}
      </h1>

      <p className="text-sm text-foreground-secondary max-w-md mb-6">
        {needsMigration ? (
          <>
            Your Supabase project is connected, but a required database migration
            has not been run yet.
          </>
        ) : sessionExpired ? (
          "Your sign-in session is no longer valid. Please sign in again to continue."
        ) : (
          error.message || "An unexpected error occurred. Please try again."
        )}
      </p>

      {needsMigration && (
        <div className="rounded-2xl border border-border bg-card p-5 max-w-lg text-left mb-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Setup steps:</p>
          <ol className="text-sm text-foreground-secondary space-y-2 list-decimal list-inside">
            <li>
              Open your{" "}
              <a
                href="https://supabase.com/dashboard/project/nisdtqsvjcybxdaucozv/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover inline-flex items-center gap-1"
              >
                Supabase SQL Editor
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Paste and run the contents of{" "}
              <code className="text-foreground bg-background-secondary px-1.5 py-0.5 rounded">
                {migrationFile}
              </code>
            </li>
            <li>Return here and refresh the page</li>
          </ol>
        </div>
      )}

      <div className="flex gap-3">
        {sessionExpired ? (
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
          >
            Sign in again
          </Link>
        ) : (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
          >
            Try again
          </button>
        )}
        {!sessionExpired && (
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg border border-border text-foreground-secondary hover:text-foreground transition-colors"
          >
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
