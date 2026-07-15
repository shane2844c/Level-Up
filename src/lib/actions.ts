"use server";

import { createClient } from "@/lib/supabase/server";
import { ACCENT_COLORS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function seedStarterData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existingCategories } = await supabase
    .from("categories")
    .select("id")
    .limit(1);

  if (existingCategories && existingCategories.length > 0) {
    return { error: "You already have data. Starter examples were not added." };
  }

  const categories = [
    { name: "Health", icon: "heart-pulse", accent_color: ACCENT_COLORS[1] },
    { name: "Mindfulness", icon: "brain", accent_color: ACCENT_COLORS[0] },
    { name: "Work", icon: "briefcase", accent_color: ACCENT_COLORS[4] },
  ];

  const insertedCategories: { id: string; name: string }[] = [];

  for (const cat of categories) {
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...cat, user_id: user.id })
      .select("id, name")
      .single();

    if (error) return { error: "Failed to create starter categories." };
    insertedCategories.push(data);
  }

  const healthId = insertedCategories.find((c) => c.name === "Health")!.id;
  const mindfulnessId = insertedCategories.find((c) => c.name === "Mindfulness")!.id;
  const workId = insertedCategories.find((c) => c.name === "Work")!.id;

  const habits = [
    { category_id: healthId, name: "Gym session", habit_type: "good" as const, xp_amount: 25 },
    { category_id: mindfulnessId, name: "Read 15 pages", habit_type: "good" as const, xp_amount: 15 },
    { category_id: workId, name: "Work on project for one hour", habit_type: "good" as const, xp_amount: 30 },
    { category_id: mindfulnessId, name: "Doom-scroll for over 30 minutes", habit_type: "bad" as const, xp_amount: 15 },
  ];

  const { error: habitsError } = await supabase
    .from("habits")
    .insert(habits.map((h) => ({ ...h, user_id: user.id })));

  if (habitsError) return { error: "Failed to create starter habits." };

  const rewards = [
    { name: "Watch one anime episode", xp_cost: 20 },
    { name: "One hour of gaming", xp_cost: 50 },
  ];

  const { error: rewardsError } = await supabase
    .from("rewards")
    .insert(rewards.map((r) => ({ ...r, user_id: user.id })));

  if (rewardsError) return { error: "Failed to create starter rewards." };

  revalidatePath("/dashboard");
  revalidatePath("/categories");
  revalidatePath("/habits");
  revalidatePath("/rewards");

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
