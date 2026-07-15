import type {
  Category,
  CategorySummary,
  Habit,
  LogHabitResult,
  RedeemRewardResult,
  Reward,
  XpSummary,
  XpTransaction,
} from "@/lib/types";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import { toDataError } from "@/lib/errors";

export async function getCurrentUser(supabase: AppSupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getXpSummary(supabase: AppSupabaseClient): Promise<XpSummary> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("bank_xp_change, transaction_type");

  if (error) throw toDataError(error);

  const transactions = data ?? [];
  let currentBalance = 0;
  let totalEarned = 0;
  let totalLost = 0;
  let totalSpent = 0;

  for (const t of transactions) {
    currentBalance += t.bank_xp_change;
    if (t.transaction_type === "good_habit") {
      totalEarned += t.bank_xp_change;
    } else if (t.transaction_type === "bad_habit") {
      totalLost += Math.abs(t.bank_xp_change);
    } else if (t.transaction_type === "reward_redemption") {
      totalSpent += Math.abs(t.bank_xp_change);
    }
  }

  return { currentBalance, totalEarned, totalLost, totalSpent };
}

export async function getCategorySummaries(
  supabase: AppSupabaseClient,
  includeInactive = false
): Promise<CategorySummary[]> {
  let categoriesQuery = supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (!includeInactive) {
    categoriesQuery = categoriesQuery.eq("is_active", true);
  }

  const { data: categories, error: catError } = await categoriesQuery;
  if (catError) throw toDataError(catError);

  const { data: transactions, error: txError } = await supabase
    .from("xp_transactions")
    .select("category_id, category_xp_change");

  if (txError) throw toDataError(txError);

  const { data: habits, error: habitError } = await supabase
    .from("habits")
    .select("category_id, habit_type, is_active");

  if (habitError) throw toDataError(habitError);

  const xpByCategory = new Map<string, number>();
  for (const tx of transactions ?? []) {
    if (tx.category_id) {
      xpByCategory.set(
        tx.category_id,
        (xpByCategory.get(tx.category_id) ?? 0) + tx.category_xp_change
      );
    }
  }

  return (categories ?? []).map((category) => {
    const categoryHabits = (habits ?? []).filter(
      (h) => h.category_id === category.id && h.is_active
    );
    return {
      category: category as Category,
      totalCategoryXp: xpByCategory.get(category.id) ?? 0,
      goodHabitCount: categoryHabits.filter((h) => h.habit_type === "good").length,
      habitCount: categoryHabits.length,
    };
  });
}

export async function getHabits(
  supabase: AppSupabaseClient,
  options?: {
    categoryId?: string;
    habitType?: "good" | "bad";
    activeOnly?: boolean;
  }
): Promise<Habit[]> {
  let query = supabase
    .from("habits")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: true });

  if (options?.activeOnly !== false) {
    query = query.eq("is_active", true);
  }
  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }
  if (options?.habitType) {
    query = query.eq("habit_type", options.habitType);
  }

  const { data, error } = await query;
  if (error) throw toDataError(error);
  return (data ?? []) as Habit[];
}

export async function getRewards(
  supabase: AppSupabaseClient,
  activeOnly = true
): Promise<Reward[]> {
  let query = supabase
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw toDataError(error);
  return (data ?? []) as Reward[];
}

export async function getRecentTransactions(
  supabase: AppSupabaseClient,
  limit = 10
): Promise<XpTransaction[]> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*, category:categories(*), habit:habits(*), reward:rewards(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw toDataError(error);
  return (data ?? []) as XpTransaction[];
}

export interface TransactionFilters {
  type?: "good_habit" | "bad_habit" | "reward_redemption" | "all";
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(
  supabase: AppSupabaseClient,
  filters?: TransactionFilters
): Promise<XpTransaction[]> {
  let query = supabase
    .from("xp_transactions")
    .select("*, category:categories(*), habit:habits(*), reward:rewards(*)")
    .order("created_at", { ascending: false });

  if (filters?.type && filters.type !== "all") {
    query = query.eq("transaction_type", filters.type);
  }
  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) throw toDataError(error);
  return (data ?? []) as XpTransaction[];
}

export async function logHabit(
  supabase: AppSupabaseClient,
  habitId: string
): Promise<LogHabitResult> {
  const { data, error } = await supabase.rpc("log_habit", {
    p_habit_id: habitId,
  });

  if (error) throw toDataError(error);
  return data as unknown as LogHabitResult;
}

export async function redeemReward(
  supabase: AppSupabaseClient,
  rewardId: string
): Promise<RedeemRewardResult> {
  const { data, error } = await supabase.rpc("redeem_reward", {
    p_reward_id: rewardId,
  });

  if (error) throw toDataError(error);
  return data as unknown as RedeemRewardResult;
}

export async function getCategories(
  supabase: AppSupabaseClient,
  includeInactive = false
): Promise<Category[]> {
  let query = supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw toDataError(error);
  return (data ?? []) as Category[];
}
