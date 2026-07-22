import { createClient } from "@/lib/supabase/server";
import { getJarPageData } from "@/lib/data";
import { TodayClient } from "@/components/habit-jar/TodayClient";

export default async function TodayPage() {
  const supabase = await createClient();
  const { habits, completions } = await getJarPageData(supabase);
  return <TodayClient habits={habits} completions={completions} />;
}
