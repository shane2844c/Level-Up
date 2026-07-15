import { createClient } from "@/lib/supabase/server";
import {
  getXpSummary,
  getCategorySummaries,
  getHabits,
  getRecentTransactions,
} from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { StarterOnboarding } from "@/components/onboarding/StarterOnboarding";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [xpSummary, categorySummaries, habits, recentTransactions] =
    await Promise.all([
      getXpSummary(supabase),
      getCategorySummaries(supabase),
      getHabits(supabase),
      getRecentTransactions(supabase, 8),
    ]);

  const isEmpty =
    categorySummaries.length === 0 &&
    habits.length === 0 &&
    recentTransactions.length === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Log habits, track XP and watch your categories level up."
      />
      {isEmpty && <StarterOnboarding />}
      <DashboardClient
        xpSummary={xpSummary}
        categorySummaries={categorySummaries}
        habits={habits}
        recentTransactions={recentTransactions}
      />
    </>
  );
}
