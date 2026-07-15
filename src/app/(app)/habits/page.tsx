import { createClient } from "@/lib/supabase/server";
import { getHabits, getCategories } from "@/lib/data";
import { HabitsClient } from "@/components/habits/HabitsClient";

export default async function HabitsPage() {
  const supabase = await createClient();

  const [habits, categories] = await Promise.all([
    getHabits(supabase),
    getCategories(supabase),
  ]);

  return <HabitsClient habits={habits} categories={categories} />;
}
