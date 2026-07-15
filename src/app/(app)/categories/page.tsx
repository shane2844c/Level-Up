import { createClient } from "@/lib/supabase/server";
import { getCategorySummaries, getCategories, getHabits } from "@/lib/data";
import { CategoriesClient } from "@/components/categories/CategoriesClient";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [summaries, allCategories, habits] = await Promise.all([
    getCategorySummaries(supabase, true),
    getCategories(supabase, true),
    getHabits(supabase, { activeOnly: false }),
  ]);

  return (
    <CategoriesClient
      summaries={summaries}
      allCategories={allCategories}
      habits={habits}
    />
  );
}
