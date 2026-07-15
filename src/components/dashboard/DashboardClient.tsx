"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { XpBalanceCard } from "@/components/dashboard/XpBalanceCard";
import { CategoryProgressCard } from "@/components/dashboard/CategoryProgressCard";
import { HabitCard } from "@/components/habits/HabitCard";
import { TransactionList } from "@/components/history/TransactionList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Repeat, FolderOpen } from "lucide-react";
import type {
  CategorySummary,
  Habit,
  XpSummary,
  XpTransaction,
} from "@/lib/types";

interface DashboardClientProps {
  xpSummary: XpSummary;
  categorySummaries: CategorySummary[];
  habits: Habit[];
  recentTransactions: XpTransaction[];
}

export function DashboardClient({
  xpSummary: initialXpSummary,
  categorySummaries: initialCategorySummaries,
  habits: initialHabits,
  recentTransactions: initialTransactions,
}: DashboardClientProps) {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const habitsByCategory = initialHabits.reduce<Record<string, Habit[]>>(
    (acc, habit) => {
      const key = habit.category_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(habit);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      <XpBalanceCard summary={initialXpSummary} />

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Category progress
        </h2>
        {initialCategorySummaries.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Create your first category"
            description="Organise your habits into areas such as Health, Work or Mindfulness."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialCategorySummaries.map((summary) => (
              <CategoryProgressCard key={summary.category.id} summary={summary} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick habit logging
        </h2>
        {initialHabits.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Add a good habit to start earning XP."
          />
        ) : (
          <div className="space-y-6">
            {initialCategorySummaries.map((summary) => {
              const categoryHabits = habitsByCategory[summary.category.id];
              if (!categoryHabits?.length) return null;
              return (
                <div key={summary.category.id}>
                  <h3 className="text-sm font-medium text-foreground-secondary mb-3">
                    {summary.category.name}
                  </h3>
                  <div className="space-y-2">
                    {categoryHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onLogged={refresh}
                        compact
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent activity
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5">
          <TransactionList transactions={initialTransactions} />
        </div>
      </section>
    </div>
  );
}
