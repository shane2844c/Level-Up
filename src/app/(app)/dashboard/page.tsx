import { createClient } from "@/lib/supabase/server";
import {
  getXpSummary,
  getHabits,
  getRecentTransactions,
  getCategories,
  getCategorySummaries,
  getTransactions,
} from "@/lib/data";
import { startOfWeek } from "@/lib/progress";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { StarterOnboarding } from "@/components/onboarding/StarterOnboarding";
import type { XpTransaction } from "@/lib/types";

function getWeekBankStats(transactions: XpTransaction[]) {
  const weekStart = startOfWeek();
  let earned = 0;
  let spent = 0;

  for (const tx of transactions) {
    if (new Date(tx.created_at) < weekStart) continue;
    if (tx.transaction_type === "good_habit" && tx.bank_xp_change > 0) {
      earned += tx.bank_xp_change;
    }
    if (tx.transaction_type === "reward_redemption") {
      spent += Math.abs(tx.bank_xp_change);
    }
  }

  return { earned, spent };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const weekStart = startOfWeek().toISOString().slice(0, 10);

  const [
    xpSummary,
    habits,
    recentTransactions,
    categories,
    categorySummaries,
    weekTransactions,
  ] = await Promise.all([
    getXpSummary(supabase),
    getHabits(supabase),
    getRecentTransactions(supabase, 5),
    getCategories(supabase),
    getCategorySummaries(supabase),
    getTransactions(supabase, { startDate: weekStart }),
  ]);

  const weekStats = getWeekBankStats(weekTransactions);

  const isEmpty =
    categories.length === 0 &&
    habits.length === 0 &&
    recentTransactions.length === 0;

  return (
    <>
      {isEmpty && <StarterOnboarding />}
      <DashboardClient
        xpSummary={xpSummary}
        habits={habits}
        recentTransactions={recentTransactions}
        categorySummaries={categorySummaries}
        weekEarned={weekStats.earned}
        weekSpent={weekStats.spent}
      />
    </>
  );
}
