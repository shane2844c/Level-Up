"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { HabitCard } from "@/components/habits/HabitCard";
import { ClosestLevelUpCard } from "@/components/mobile/ClosestLevelUpCard";
import { MobileFilterChips } from "@/components/mobile/MobileFilterChips";
import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { MobileTransactionPreview } from "@/components/mobile/MobileTransactionFeed";
import { MobileXpBalanceCard } from "@/components/mobile/MobileXpBalanceCard";
import { XpBalanceCard } from "@/components/dashboard/XpBalanceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { usePwaEnvironment } from "@/hooks/usePwaEnvironment";
import { ChevronDown, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategorySummary, Habit, XpSummary, XpTransaction } from "@/lib/types";

interface DashboardClientProps {
  xpSummary: XpSummary;
  habits: Habit[];
  recentTransactions: XpTransaction[];
  categorySummaries: CategorySummary[];
  weekEarned: number;
  weekSpent: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTodayDate() {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function DashboardClient({
  xpSummary: initialXpSummary,
  habits: initialHabits,
  recentTransactions: initialTransactions,
  categorySummaries,
  weekEarned,
  weekSpent,
}: DashboardClientProps) {
  const router = useRouter();
  const { standalone } = usePwaEnvironment();
  const [recentActivityOpen, setRecentActivityOpen] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const categoryChips = useMemo(() => {
    const categories = new Map<string, string>();
    for (const habit of initialHabits) {
      categories.set(habit.category_id, habit.category?.name ?? "Uncategorised");
    }
    return [
      { value: "all", label: "All" },
      ...Array.from(categories.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [initialHabits]);

  const filteredHabits = useMemo(() => {
    if (categoryFilter === "all") return initialHabits;
    return initialHabits.filter((habit) => habit.category_id === categoryFilter);
  }, [initialHabits, categoryFilter]);

  const previewHabits = filteredHabits.slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8">
      <MobilePageHeader
        title={getGreeting()}
        subtitle={formatTodayDate()}
        showSettings
        className="md:hidden"
      />

      {!standalone && (
        <div className="md:hidden">
          <InstallPrompt variant="card" />
        </div>
      )}

      <div className="md:hidden">
        <MobileXpBalanceCard
          summary={initialXpSummary}
          weekEarned={weekEarned}
          weekSpent={weekSpent}
        />
      </div>
      <div className="hidden md:block">
        <XpBalanceCard summary={initialXpSummary} />
      </div>

      <section className="md:hidden">
        <MobileSectionHeader
          title="Quick habit logging"
          href="/habits"
          actionLabel="View all habits"
        />

        {initialHabits.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Add your first habit to start earning XP."
            action={
              <Link
                href="/habits"
                className="inline-flex min-h-[44px] items-center px-4 py-2.5 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
              >
                Add habit
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {categoryChips.length > 2 && (
              <MobileFilterChips
                options={categoryChips}
                value={categoryFilter}
                onChange={setCategoryFilter}
                ariaLabel="Filter habits by category"
              />
            )}

            <div className="space-y-3">
              {previewHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onLogged={refresh}
                  mobile
                />
              ))}
            </div>

            {filteredHabits.length > 5 && (
              <Link
                href="/habits"
                className="inline-flex min-h-[44px] items-center text-sm text-primary hover:text-primary-hover transition-colors active:opacity-70"
              >
                View all habits ({filteredHabits.length})
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="md:hidden">
        <ClosestLevelUpCard summaries={categorySummaries} />
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
          <button
            type="button"
            onClick={() => setRecentActivityOpen((open) => !open)}
            aria-expanded={recentActivityOpen}
            aria-label={recentActivityOpen ? "Collapse recent activity" : "Expand recent activity"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground-secondary hover:text-foreground hover:border-primary/30 transition-colors active:opacity-70"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none",
                recentActivityOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {recentActivityOpen && (
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            {initialTransactions.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">
                No activity yet. Your completed habits and rewards will appear here.
              </p>
            ) : (
              <MobileTransactionPreview transactions={initialTransactions} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
