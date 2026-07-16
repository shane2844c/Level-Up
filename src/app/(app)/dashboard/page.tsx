import { createClient } from "@/lib/supabase/server";
import {
  getXpSummary,
  getHabits,
  getRecentTransactions,
  getCategories,
} from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { StarterOnboarding } from "@/components/onboarding/StarterOnboarding";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [xpSummary, habits, recentTransactions, categories] = await Promise.all([
    getXpSummary(supabase),
    getHabits(supabase),
    getRecentTransactions(supabase, 8),
    getCategories(supabase),
  ]);

  const isEmpty =
    categories.length === 0 &&
    habits.length === 0 &&
    recentTransactions.length === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Log habits and track your spendable XP."
      />
      {isEmpty && <StarterOnboarding />}
      <DashboardClient
        xpSummary={xpSummary}
        habits={habits}
        recentTransactions={recentTransactions}
      />
    </>
  );
}
