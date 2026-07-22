"use client";

import { useMemo } from "react";
import { InsightCard } from "@/components/habit-jar/InsightCard";
import { buildInsightsData, mapCompletionTransactions } from "@/lib/jar-stats";
import type { Habit, XpTransaction } from "@/lib/types";

interface InsightsClientProps {
  habits: Habit[];
  completions: Pick<XpTransaction, "id" | "habit_id" | "created_at">[];
}

export function InsightsClient({ habits, completions }: InsightsClientProps) {
  const insights = useMemo(() => {
    const rows = mapCompletionTransactions(completions);
    return buildInsightsData(habits, rows);
  }, [habits, completions]);

  const maxTrend = Math.max(...insights.weeklyTrend.map((d) => d.count), 1);

  return (
    <>
      <header className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#ede9fe] via-[#fdf2f8] to-[#ecfeff] p-6 md:p-8 border border-white/70 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--jar-text)]">Insights</h1>
        <p className="mt-2 text-[var(--jar-text-secondary)]">
          Patterns in your consistency — measured in coins, not points.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InsightCard title="This week" value={String(insights.coinsThisWeek)} accent="#8b5cf6" />
        <InsightCard title="This month" value={String(insights.coinsThisMonth)} accent="#06b6d4" />
        <InsightCard
          title="Most consistent"
          value={insights.mostConsistentJar?.name ?? "—"}
          subtitle={
            insights.mostConsistentJar
              ? `${insights.mostConsistentJar.count} coins this week`
              : "Log coins to see trends"
          }
          accent={insights.mostConsistentJar?.accent}
        />
        <InsightCard
          title="Needs attention"
          value={insights.needsAttentionJar?.name ?? "—"}
          subtitle="Lowest activity this week"
          accent={insights.needsAttentionJar?.accent ?? "#f97316"}
        />
      </div>

      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-[var(--jar-text)] mb-4">Weekly trend</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {insights.weeklyTrend.map((day) => (
            <div key={day.dateKey} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className="w-full max-w-[2rem] rounded-t-xl bg-gradient-to-t from-indigo-500 to-violet-400 transition-all"
                  style={{ height: `${Math.max(8, (day.count / maxTrend) * 100)}%` }}
                  title={`${day.count} coins`}
                />
              </div>
              <span className="text-[11px] text-[var(--jar-text-muted)]">{day.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--jar-text-secondary)]">
          Your most active day this week: <strong>{insights.bestDay}</strong>
        </p>
      </section>

      {insights.activeStreaks.length > 0 && (
        <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--jar-text)] mb-4">Active streaks</h2>
          <ul className="space-y-3">
            {insights.activeStreaks.map((jar) => (
              <li
                key={jar.name}
                className="flex items-center justify-between rounded-xl bg-[var(--jar-surface-muted)] px-4 py-3"
              >
                <span className="font-medium text-[var(--jar-text)]">{jar.name}</span>
                <span className="font-bold tabular-nums" style={{ color: jar.accent }}>
                  {jar.streak} day{jar.streak !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
