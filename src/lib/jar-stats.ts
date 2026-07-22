import type { Habit, XpTransaction } from "@/lib/types";

export interface HabitJarStats {
  habitId: string;
  totalCoins: number;
  coinsToday: number;
  currentStreak: number;
  bestStreak: number;
  weeklyCounts: { label: string; dateKey: string; count: number }[];
  calendarDays: { dateKey: string; count: number; inMonth: boolean }[];
  recentAdditions: { id: string; createdAt: string }[];
  latestTransactionId: string | null;
}

export interface JarDashboardStats {
  coinsToday: number;
  coinsThisWeek: number;
  activeJarCount: number;
}

interface CompletionRow {
  id: string;
  habit_id: string;
  created_at: string;
}

export function toLocalDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const msA = new Date(ay, am - 1, ad).getTime();
  const msB = new Date(by, bm - 1, bd).getTime();
  return Math.round((msB - msA) / (1000 * 60 * 60 * 24));
}

export function computeStreaks(dateKeys: string[]): {
  currentStreak: number;
  bestStreak: number;
} {
  const unique = [...new Set(dateKeys)].sort();
  if (unique.length === 0) return { currentStreak: 0, bestStreak: 0 };

  let bestStreak = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (daysBetween(unique[i - 1], unique[i]) === 1) {
      run += 1;
      bestStreak = Math.max(bestStreak, run);
    } else {
      run = 1;
    }
  }

  const today = toLocalDateKey(new Date());
  const yesterday = addDays(today, -1);
  let anchor: string | null = null;
  if (unique.includes(today)) anchor = today;
  else if (unique.includes(yesterday)) anchor = yesterday;

  let currentStreak = 0;
  if (anchor) {
    currentStreak = 1;
    let cursor = anchor;
    while (true) {
      const prev = addDays(cursor, -1);
      if (unique.includes(prev)) {
        currentStreak += 1;
        cursor = prev;
      } else {
        break;
      }
    }
  }

  return { currentStreak, bestStreak };
}

export function buildHabitJarStats(
  habitId: string,
  completions: CompletionRow[],
  now = new Date()
): HabitJarStats {
  const habitCompletions = completions
    .filter((row) => row.habit_id === habitId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const dateKeys = habitCompletions.map((row) => toLocalDateKey(row.created_at));
  const { currentStreak, bestStreak } = computeStreaks(dateKeys);
  const todayKey = toLocalDateKey(now);

  const weeklyCounts = Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    const dateKey = addDays(todayKey, -offset);
    const date = new Date(
      Number(dateKey.slice(0, 4)),
      Number(dateKey.slice(5, 7)) - 1,
      Number(dateKey.slice(8, 10))
    );
    const label = new Intl.DateTimeFormat("en-AU", { weekday: "short" }).format(date);
    const count = habitCompletions.filter(
      (row) => toLocalDateKey(row.created_at) === dateKey
    ).length;
    return { label, dateKey, count };
  });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const calendarDays: HabitJarStats["calendarDays"] = [];
  for (let day = 1; day <= monthEnd.getDate(); day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const dateKey = toLocalDateKey(date);
    calendarDays.push({
      dateKey,
      count: habitCompletions.filter((row) => toLocalDateKey(row.created_at) === dateKey)
        .length,
      inMonth: true,
    });
  }

  return {
    habitId,
    totalCoins: habitCompletions.length,
    coinsToday: habitCompletions.filter((row) => toLocalDateKey(row.created_at) === todayKey)
      .length,
    currentStreak,
    bestStreak,
    weeklyCounts,
    calendarDays,
    recentAdditions: habitCompletions.slice(0, 8).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
    })),
    latestTransactionId: habitCompletions[0]?.id ?? null,
  };
}

export function buildJarStatsMap(
  habitIds: string[],
  completions: CompletionRow[]
): Map<string, HabitJarStats> {
  const map = new Map<string, HabitJarStats>();
  for (const habitId of habitIds) {
    map.set(habitId, buildHabitJarStats(habitId, completions));
  }
  return map;
}

export function buildJarDashboardStats(
  habits: Habit[],
  completions: CompletionRow[]
): JarDashboardStats {
  const todayKey = toLocalDateKey(new Date());
  const weekKeys = new Set(
    Array.from({ length: 7 }, (_, i) => addDays(todayKey, -i))
  );

  let coinsToday = 0;
  let coinsThisWeek = 0;
  for (const row of completions) {
    const key = toLocalDateKey(row.created_at);
    if (key === todayKey) coinsToday += 1;
    if (weekKeys.has(key)) coinsThisWeek += 1;
  }

  return {
    coinsToday,
    coinsThisWeek,
    activeJarCount: habits.filter((h) => h.habit_type === "good" && h.is_active).length,
  };
}

export function getJarAccentColor(habit: Habit): string {
  return (
    habit.accent_color ??
    habit.category?.accent_color ??
    "#58C7FF"
  );
}

export function getJarIcon(habit: Habit): string {
  if (habit.icon) return habit.icon;
  if (habit.category?.icon && !habit.category.icon.includes("-")) {
    return habit.category.icon;
  }
  return "🫙";
}

export function getJarIdentityStatement(habit: Habit): string | null {
  return habit.identity_statement ?? habit.description;
}

export function getVisibleCoinSlots(total: number): number {
  if (total <= 0) return 0;
  if (total <= 12) return total;
  if (total <= 40) return 12 + Math.ceil((total - 12) / 4);
  return 20;
}

export function getJarFillPercent(total: number, target?: number | null): number {
  const goal = target && target > 0 ? target : Math.max(total, 20);
  return Math.min(100, Math.round((total / goal) * 100));
}

export type HabitCompletionRow = CompletionRow;

export function mapCompletionTransactions(
  transactions: Pick<XpTransaction, "id" | "habit_id" | "created_at">[]
): CompletionRow[] {
  return transactions
    .filter((tx): tx is CompletionRow => Boolean(tx.habit_id))
    .map((tx) => ({
      id: tx.id,
      habit_id: tx.habit_id as string,
      created_at: tx.created_at,
    }));
}

export interface JourneyEvent {
  id: string;
  type: "coin" | "milestone" | "streak";
  title: string;
  subtitle?: string;
  createdAt: string;
  accentColor?: string;
}

const MILESTONES = [1, 10, 25, 50, 100];
const STREAK_MILESTONES = [7, 30];

export function buildJourneyEvents(
  habits: Habit[],
  completions: CompletionRow[]
): JourneyEvent[] {
  const events: JourneyEvent[] = [];
  const habitMap = new Map(habits.map((h) => [h.id, h]));

  for (const row of completions.slice(0, 30)) {
    const habit = habitMap.get(row.habit_id);
    if (!habit) continue;
    events.push({
      id: `coin-${row.id}`,
      type: "coin",
      title: `Added a coin to ${habit.name}`,
      subtitle: "Another vote for your future self",
      createdAt: row.created_at,
      accentColor: getJarAccentColor(habit),
    });
  }

  for (const habit of habits) {
    const stats = buildHabitJarStats(habit.id, completions);
    const accent = getJarAccentColor(habit);
    for (const m of MILESTONES) {
      if (stats.totalCoins >= m) {
        events.push({
          id: `milestone-${habit.id}-${m}`,
          type: "milestone",
          title: `${habit.name} reached ${m} coins`,
          subtitle: "Consistency compounds",
          createdAt: habit.created_at,
          accentColor: accent,
        });
      }
    }
    for (const s of STREAK_MILESTONES) {
      if (stats.bestStreak >= s) {
        events.push({
          id: `streak-${habit.id}-${s}`,
          type: "streak",
          title: `${s}-day streak on ${habit.name}`,
          subtitle: "Identity in action",
          createdAt: new Date().toISOString(),
          accentColor: accent,
        });
      }
    }
  }

  return events
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 40);
}

export interface InsightsData {
  coinsThisWeek: number;
  coinsThisMonth: number;
  mostConsistentJar: { name: string; count: number; accent: string } | null;
  needsAttentionJar: { name: string; count: number; accent: string } | null;
  weeklyTrend: { label: string; dateKey: string; count: number }[];
  bestDay: string;
  activeStreaks: { name: string; streak: number; accent: string }[];
}

export function buildInsightsData(
  habits: Habit[],
  completions: CompletionRow[]
): InsightsData {
  const todayKey = toLocalDateKey(new Date());
  const weekKeys = Array.from({ length: 7 }, (_, i) => addDays(todayKey, -6 + i));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let coinsThisWeek = 0;
  let coinsThisMonth = 0;
  const dayCounts = new Map<string, number>();

  for (const row of completions) {
    const key = toLocalDateKey(row.created_at);
    if (weekKeys.includes(key)) coinsThisWeek += 1;
    if (new Date(row.created_at) >= monthStart) coinsThisMonth += 1;
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  const weeklyTrend = weekKeys.map((dateKey) => {
    const date = new Date(
      Number(dateKey.slice(0, 4)),
      Number(dateKey.slice(5, 7)) - 1,
      Number(dateKey.slice(8, 10))
    );
    return {
      label: new Intl.DateTimeFormat("en-AU", { weekday: "short" }).format(date),
      dateKey,
      count: completions.filter((r) => toLocalDateKey(r.created_at) === dateKey).length,
    };
  });

  const weekStart = addDays(todayKey, -6);
  const jarWeekCounts = habits.map((habit) => {
    const count = completions.filter(
      (r) =>
        r.habit_id === habit.id &&
        toLocalDateKey(r.created_at) >= weekStart &&
        toLocalDateKey(r.created_at) <= todayKey
    ).length;
    return { habit, count };
  });

  const sorted = [...jarWeekCounts].sort((a, b) => b.count - a.count);
  const most = sorted[0]?.count ? sorted[0] : null;
  const least = sorted.filter((j) => j.count === 0)[0] ?? sorted[sorted.length - 1];

  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const row of completions) {
    const d = new Date(row.created_at);
    if (d >= new Date(weekStart)) dayOfWeekCounts[d.getDay()] += 1;
  }
  const bestDayIndex = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const bestDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][bestDayIndex] ?? "—";

  const activeStreaks = habits
    .map((habit) => ({
      name: habit.name,
      streak: buildHabitJarStats(habit.id, completions).currentStreak,
      accent: getJarAccentColor(habit),
    }))
    .filter((j) => j.streak > 0)
    .sort((a, b) => b.streak - a.streak);

  return {
    coinsThisWeek,
    coinsThisMonth,
    mostConsistentJar: most
      ? { name: most.habit.name, count: most.count, accent: getJarAccentColor(most.habit) }
      : null,
    needsAttentionJar: least
      ? { name: least.habit.name, count: least.count, accent: getJarAccentColor(least.habit) }
      : null,
    weeklyTrend,
    bestDay,
    activeStreaks,
  };
}

export const SUCCESS_TOASTS = [
  "Another vote for your future self.",
  "Your identity is built one action at a time.",
  "One more coin earned.",
  "You showed up today.",
] as const;
