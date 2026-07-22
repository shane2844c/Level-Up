import { createClient } from "@/lib/supabase/server";
import { getJarPageData } from "@/lib/data";
import { JourneyClient } from "@/components/habit-jar/JourneyClient";

export default async function JourneyPage() {
  const supabase = await createClient();
  const { habits, completions } = await getJarPageData(supabase);
  return <JourneyClient habits={habits} completions={completions} />;
}
