import { createClient } from "@/lib/supabase/server";
import { getJarPageData } from "@/lib/data";
import { InsightsClient } from "@/components/habit-jar/InsightsClient";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { habits, completions } = await getJarPageData(supabase);
  return <InsightsClient habits={habits} completions={completions} />;
}
