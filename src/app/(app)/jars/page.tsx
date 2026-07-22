import { createClient } from "@/lib/supabase/server";
import { getJarPageData, getCategories } from "@/lib/data";
import { getGreeting } from "@/lib/greeting";
import { MyJarsClient } from "@/components/habit-jar/MyJarsClient";

export default async function MyJarsPage() {
  const supabase = await createClient();
  const [{ habits, completions }, categories] = await Promise.all([
    getJarPageData(supabase),
    getCategories(supabase),
  ]);

  return (
    <MyJarsClient
      habits={habits}
      categories={categories}
      completions={completions}
      greeting={getGreeting()}
    />
  );
}
