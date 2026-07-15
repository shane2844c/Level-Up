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

export function formatDataError(error: unknown): string {
  if (isMissingTableError(error)) {
    return "Database tables are not set up yet. Run the SQL migration in your Supabase project.";
  }

  if (isSupabaseError(error)) {
    if (error.code === "PGRST301" || error.message?.includes("JWT")) {
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
