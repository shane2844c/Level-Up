import type { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSupabaseClient = Awaited<ReturnType<typeof createClient>> & SupabaseClient;
