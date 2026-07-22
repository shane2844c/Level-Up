interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

export function isSupabaseError(error: unknown): error is SupabaseErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as SupabaseErrorLike).message === "string"
  );
}

export function isMissingTableError(error: unknown): boolean {
  if (!isSupabaseError(error)) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (error.message?.includes("Could not find the table") ?? false) ||
    (error.message?.includes("does not exist") ?? false)
  );
}

export function isMissingLevelEventsTable(error: unknown): boolean {
  if (!isSupabaseError(error)) return false;
  return (
    isMissingTableError(error) &&
    (error.message?.includes("category_level_events") ?? false)
  );
}

export function isAuthSessionError(error: unknown): boolean {
  if (!isSupabaseError(error)) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "PGRST301" ||
    error.code === "401" ||
    message.includes("jwt expired") ||
    message.includes("invalid jwt") ||
    message.includes("invalid claim") ||
    message.includes("session missing") ||
    message.includes("not authenticated") ||
    message.includes("refresh_token")
  );
}

export function formatDataError(error: unknown): string {
  if (isMissingLevelEventsTable(error)) {
    return "Progress tables are not set up yet. Run supabase/migrations/002_progress_level_events.sql in your Supabase SQL Editor.";
  }

  if (isMissingTableError(error)) {
    return "Database tables are not set up yet. Run supabase/migrations/001_initial_schema.sql in your Supabase SQL Editor.";
  }

  if (isSupabaseError(error)) {
    if (isAuthSessionError(error)) {
      return "Your session has expired. Please sign in again.";
    }
    return error.message ?? "Something went wrong loading your data.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong loading your data.";
}

export function toDataError(error: unknown): Error {
  return new Error(formatDataError(error));
}

export function isSessionExpiredMessage(message: string): boolean {
  return message.includes("Your session has expired");
}
