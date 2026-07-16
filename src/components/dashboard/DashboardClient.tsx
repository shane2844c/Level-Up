"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { XpBalanceCard } from "@/components/dashboard/XpBalanceCard";
import { HabitCard } from "@/components/habits/HabitCard";
import { TransactionList } from "@/components/history/TransactionList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChevronDown, Repeat, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit, XpSummary, XpTransaction } from "@/lib/types";

interface DashboardClientProps {
  xpSummary: XpSummary;
  habits: Habit[];
  recentTransactions: XpTransaction[];
}

export function DashboardClient({
  xpSummary: initialXpSummary,
  habits: initialHabits,
  recentTransactions: initialTransactions,
}: DashboardClientProps) {
  const router = useRouter();
  const [recentActivityOpen, setRecentActivityOpen] = useState(true);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const habitsByCategory = useMemo(() => {
    const map = new Map<string, { name: string; habits: Habit[] }>();
    for (const habit of initialHabits) {
      const key = habit.category_id;
      const name = habit.category?.name ?? "Uncategorised";
      const existing = map.get(key) ?? { name, habits: [] };
      existing.habits.push(habit);
      map.set(key, existing);
    }
    return Array.from(map.values());
  }, [initialHabits]);

  return (
    <div className="space-y-8">
      <XpBalanceCard summary={initialXpSummary} />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Quick habit logging
          </h2>
          <Link
            href="/progress"
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            View progress
          </Link>
        </div>
        {initialHabits.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Add a good habit to start earning XP."
          />
        ) : (
          <div className="space-y-6">
            {habitsByCategory.map((group) => (
              <div key={group.name}>
                <h3 className="text-sm font-medium text-foreground-secondary mb-3">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onLogged={refresh}
                      compact
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-primary transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Progress
            </Link>
            <button
              type="button"
              onClick={() => setRecentActivityOpen((open) => !open)}
              aria-expanded={recentActivityOpen}
              aria-label={recentActivityOpen ? "Collapse recent activity" : "Expand recent activity"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground-secondary hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  recentActivityOpen && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
        {recentActivityOpen && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <TransactionList transactions={initialTransactions} />
          </div>
        )}
      </section>
    </div>
  );
}
