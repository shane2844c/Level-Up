import type { AppSupabaseClient } from "@/lib/supabase/types";
import { isMissingLevelEventsTable, toDataError } from "@/lib/errors";
import { getLevelFromXp, getLevelProgress, getLevelsGained } from "@/lib/levels";
import type {
  Category,
  CategoryDetailStats,
  CategoryLevelEvent,
  CategoryXpShare,
  ChartDataPoint,
  ExpandedCategoryProgress,
  HabitContribution,
  ProgressOverviewStats,
  UpcomingMilestone,
  XpTransaction,
} from "@/lib/types";

interface GoodHabitRow {
  category_id: string | null;
  habit_id: string | null;
  category_xp_change: number;
  created_at: string;
  habit: { name: string } | { name: string }[] | null;
}

function habitName(habit: GoodHabitRow["habit"]): string {
  if (!habit) return "Unknown habit";
  if (Array.isArray(habit)) return habit[0]?.name ?? "Unknown habit";
  return habit.name;
}

export function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonth(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function toWeekKey(iso: string): string {
  const d = new Date(iso);
  const weekStart = startOfWeek(d);
  return toDateKey(weekStart.toISOString());
}

async function fetchGoodHabitTransactions(supabase: AppSupabaseClient) {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("category_id, habit_id, category_xp_change, created_at, habit:habits(name)")
    .eq("transaction_type", "good_habit")
    .gt("category_xp_change", 0)
    .order("created_at", { ascending: true });

  if (error) throw toDataError(error);
  return (data ?? []) as GoodHabitRow[];
}

function buildXpByCategory(rows: GoodHabitRow[]) {
  const map = new Map<string, number>();
  for (const row of rows) {
    if (!row.category_id) continue;
    map.set(
      row.category_id,
      (map.get(row.category_id) ?? 0) + row.category_xp_change
    );
  }
  return map;
}

export async function getProgressOverviewStats(
  supabase: AppSupabaseClient,
  categories: Category[]
): Promise<ProgressOverviewStats> {
  const rows = await fetchGoodHabitTransactions(supabase);
  const weekStart = startOfWeek();

  let lifetimeCategoryXp = 0;
  let weekCategoryXp = 0;
  const xpByCategory = buildXpByCategory(rows);

  for (const row of rows) {
    lifetimeCategoryXp += row.category_xp_change;
    if (new Date(row.created_at) >= weekStart) {
      weekCategoryXp += row.category_xp_change;
    }
  }

  let totalLevelsGained = 0;
  let strongest: { category: Category; xp: number } | null = null;

  for (const category of categories.filter((c) => c.is_active)) {
    const xp = xpByCategory.get(category.id) ?? 0;
    totalLevelsGained += getLevelsGained(xp);
    if (!strongest || xp > strongest.xp) {
      strongest = { category, xp };
    }
  }

  return {
    lifetimeCategoryXp,
    weekCategoryXp,
    totalLevelsGained,
    strongestCategory: strongest && strongest.xp > 0 ? strongest : null,
  };
}

export async function getExpandedCategoryProgress(
  supabase: AppSupabaseClient,
  categories: Category[]
): Promise<ExpandedCategoryProgress[]> {
  const rows = await fetchGoodHabitTransactions(supabase);
  const weekStart = startOfWeek();
  const xpByCategory = buildXpByCategory(rows);

  const { data: habits, error } = await supabase
    .from("habits")
    .select("id, category_id, is_active")
    .eq("is_active", true);

  if (error) throw toDataError(error);

  const habitCountByCategory = new Map<string, number>();
  for (const h of habits ?? []) {
    habitCountByCategory.set(
      h.category_id,
      (habitCountByCategory.get(h.category_id) ?? 0) + 1
    );
  }

  return categories
    .filter((c) => c.is_active)
    .map((category) => {
      const categoryRows = rows.filter((r) => r.category_id === category.id);
      const weekXp = categoryRows
        .filter((r) => new Date(r.created_at) >= weekStart)
        .reduce((sum, r) => sum + r.category_xp_change, 0);

      const habitStats = new Map<string, { name: string; xp: number; count: number }>();
      for (const row of categoryRows) {
        if (!row.habit_id) continue;
        const name = habitName(row.habit);
        const existing = habitStats.get(row.habit_id) ?? { name, xp: 0, count: 0 };
        existing.xp += row.category_xp_change;
        existing.count += 1;
        habitStats.set(row.habit_id, existing);
      }

      let topHabit: { name: string; xp: number } | null = null;
      for (const stat of habitStats.values()) {
        if (!topHabit || stat.xp > topHabit.xp) {
          topHabit = { name: stat.name, xp: stat.xp };
        }
      }

      return {
        category,
        totalCategoryXp: xpByCategory.get(category.id) ?? 0,
        weekXp,
        goodCompletions: categoryRows.length,
        topHabit,
        activeHabitCount: habitCountByCategory.get(category.id) ?? 0,
      };
    });
}

export function buildChartData(
  rows: GoodHabitRow[],
  grouping: "day" | "week"
): ChartDataPoint[] {
  const map = new Map<string, number>();

  for (const row of rows) {
    if (!row.category_id) continue;
    const key =
      grouping === "day"
        ? `${row.category_id}:${toDateKey(row.created_at)}`
        : `${row.category_id}:${toWeekKey(row.created_at)}`;
    map.set(key, (map.get(key) ?? 0) + row.category_xp_change);
  }

  const points: ChartDataPoint[] = [];
  for (const [key, xp] of map.entries()) {
    const [categoryId, date] = key.split(":");
    points.push({ date, categoryId, xp });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getChartData(supabase: AppSupabaseClient): Promise<ChartDataPoint[]> {
  const rows = await fetchGoodHabitTransactions(supabase);
  return buildChartData(rows, "day");
}

export function getCategoryXpBreakdown(
  categories: Category[],
  xpByCategory: Map<string, number>
): CategoryXpShare[] {
  const active = categories.filter((c) => c.is_active);
  const total = active.reduce((sum, c) => sum + (xpByCategory.get(c.id) ?? 0), 0);

  return active
    .map((category) => {
      const xp = xpByCategory.get(category.id) ?? 0;
      return {
        category,
        xp,
        percentage: total > 0 ? Math.round((xp / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.xp - a.xp);
}

export function getHabitContributions(rows: GoodHabitRow[], categories: Category[]): {
  byXp: HabitContribution[];
  byCompletions: HabitContribution[];
} {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const stats = new Map<string, HabitContribution>();

  for (const row of rows) {
    if (!row.habit_id || !row.category_id) continue;
    const existing = stats.get(row.habit_id) ?? {
      habitId: row.habit_id,
      habitName: habitName(row.habit),
      categoryName: categoryMap.get(row.category_id) ?? "Unknown",
      categoryId: row.category_id,
      completions: 0,
      totalXp: 0,
    };
    existing.completions += 1;
    existing.totalXp += row.category_xp_change;
    stats.set(row.habit_id, existing);
  }

  const all = Array.from(stats.values());
  const byXp = [...all].sort((a, b) => b.totalXp - a.totalXp).slice(0, 10);
  const byCompletions = [...all].sort((a, b) => b.completions - a.completions).slice(0, 10);

  return { byXp, byCompletions };
}

export async function getLevelEvents(
  supabase: AppSupabaseClient,
  categoryId?: string,
  limit = 10
): Promise<CategoryLevelEvent[]> {
  let query = supabase
    .from("category_level_events")
    .select("*, category:categories(*)")
    .order("reached_at", { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) {
    // Level events table is added in migration 002 — degrade gracefully if not run yet
    if (isMissingLevelEventsTable(error)) return [];
    throw toDataError(error);
  }
  return (data ?? []) as CategoryLevelEvent[];
}

export function getUpcomingMilestones(
  categories: Category[],
  xpByCategory: Map<string, number>
): UpcomingMilestone[] {
  return categories
    .filter((c) => c.is_active)
    .map((category) => {
      const totalXp = xpByCategory.get(category.id) ?? 0;
      const progress = getLevelProgress(totalXp);
      return {
        category,
        currentLevel: progress.level,
        nextLevel: progress.isMaxLevel ? 10 : progress.level + 1,
        xpRemaining: progress.xpRemaining,
        progressPercent: progress.progressPercent,
        totalXp,
      };
    })
    .filter((m) => m.currentLevel < 10)
    .sort((a, b) => a.xpRemaining - b.xpRemaining);
}

export async function getCategoryForUser(
  supabase: AppSupabaseClient,
  categoryId: string
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw toDataError(error);
  }
  return data as Category;
}

export async function getCategoryDetailStats(
  supabase: AppSupabaseClient,
  categoryId: string
): Promise<CategoryDetailStats | null> {
  const category = await getCategoryForUser(supabase, categoryId);
  if (!category) return null;

  const { data: goodRows, error: goodError } = await supabase
    .from("xp_transactions")
    .select("category_xp_change, created_at")
    .eq("category_id", categoryId)
    .eq("transaction_type", "good_habit")
    .gt("category_xp_change", 0);

  if (goodError) throw toDataError(goodError);

  const { count: badCount, error: badError } = await supabase
    .from("xp_transactions")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("transaction_type", "bad_habit");

  if (badError) throw toDataError(badError);

  const { count: activeHabits, error: habitError } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("is_active", true);

  if (habitError) throw toDataError(habitError);

  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  let totalCategoryXp = 0;
  let weekXp = 0;
  let monthXp = 0;

  for (const row of goodRows ?? []) {
    totalCategoryXp += row.category_xp_change;
    const created = new Date(row.created_at);
    if (created >= weekStart) weekXp += row.category_xp_change;
    if (created >= monthStart) monthXp += row.category_xp_change;
  }

  return {
    category,
    totalCategoryXp,
    weekXp,
    monthXp,
    goodCompletions: goodRows?.length ?? 0,
    badOccurrences: badCount ?? 0,
    activeHabitCount: activeHabits ?? 0,
    levelProgress: getLevelProgress(totalCategoryXp),
  };
}

export async function getCategoryGoodHabitRows(
  supabase: AppSupabaseClient,
  categoryId: string
): Promise<GoodHabitRow[]> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("category_id, habit_id, category_xp_change, created_at, habit:habits(name)")
    .eq("category_id", categoryId)
    .eq("transaction_type", "good_habit")
    .gt("category_xp_change", 0)
    .order("created_at", { ascending: true });

  if (error) throw toDataError(error);
  return (data ?? []) as GoodHabitRow[];
}

export async function getCategoryTransactions(
  supabase: AppSupabaseClient,
  categoryId: string,
  limit = 15
): Promise<XpTransaction[]> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*, category:categories(*), habit:habits(*)")
    .eq("category_id", categoryId)
    .in("transaction_type", ["good_habit", "bad_habit"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw toDataError(error);
  return (data ?? []) as XpTransaction[];
}

export async function getProgressPageData(supabase: AppSupabaseClient) {
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (catError) throw toDataError(catError);

  const cats = (categories ?? []) as Category[];
  const goodRows = await fetchGoodHabitTransactions(supabase);
  const xpByCategory = buildXpByCategory(goodRows);

  const [
    stats,
    expandedCategories,
    levelEvents,
  ] = await Promise.all([
    getProgressOverviewStats(supabase, cats),
    getExpandedCategoryProgress(supabase, cats),
    getLevelEvents(supabase, undefined, 8),
  ]);

  const chartData = buildChartData(goodRows, "day");
  const breakdown = getCategoryXpBreakdown(cats, xpByCategory);
  const habitContributions = getHabitContributions(goodRows, cats);
  const milestones = getUpcomingMilestones(cats, xpByCategory);

  return {
    stats,
    expandedCategories,
    chartData,
    breakdown,
    habitContributions,
    levelEvents,
    milestones,
    categories: cats,
  };
}
