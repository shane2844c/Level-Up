"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { VisualJar } from "@/components/habit-jar/VisualJar";
import { AddCoinButton } from "@/components/habit-jar/AddCoinButton";
import { useAddCoin } from "@/hooks/useAddCoin";
import {
  buildJarDashboardStats,
  getJarAccentColor,
  getJarIcon,
  mapCompletionTransactions,
} from "@/lib/jar-stats";
import type { Habit, XpTransaction } from "@/lib/types";

interface TodayClientProps {
  habits: Habit[];
  completions: Pick<XpTransaction, "id" | "habit_id" | "created_at">[];
}

export function TodayClient({ habits, completions }: TodayClientProps) {
  const router = useRouter();
  const completionRows = useMemo(() => mapCompletionTransactions(completions), [completions]);
  const { addCoin, processingId, glowingId, getStats, syncCompletions } =
    useAddCoin(completionRows);

  useEffect(() => {
    syncCompletions(completionRows);
  }, [completionRows, syncCompletions]);

  const stats = useMemo(
    () => buildJarDashboardStats(habits, completionRows),
    [habits, completionRows]
  );

  const completedToday = habits.filter((h) => getStats(h.id).coinsToday > 0).length;

  const handleAddCoin = async (habit: Habit) => {
    await addCoin(habit);
    router.refresh();
  };

  return (
    <>
      <header className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#ecfdf5] via-[#f0f9ff] to-[#fdf4ff] p-6 md:p-8 border border-white/70 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--jar-text)]">
          Today&apos;s votes for your future self
        </h1>
        <p className="mt-2 text-[var(--jar-text-secondary)]">
          {completedToday} of {habits.length} jars have coins today · {stats.coinsToday} total coins earned
        </p>
      </header>

      {habits.length === 0 ? (
        <p className="text-center text-[var(--jar-text-muted)] py-12">
          Create a jar on My Jars to start building today&apos;s momentum.
        </p>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const jarStats = getStats(habit.id);
            const accent = getJarAccentColor(habit);
            const doneToday = jarStats.coinsToday > 0;

            return (
              <article
                key={habit.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-2xl">{getJarIcon(habit)}</span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--jar-text)] truncate">{habit.name}</h2>
                    <p className="text-xs text-[var(--jar-text-muted)] mt-0.5">
                      {doneToday ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {jarStats.coinsToday} coin{jarStats.coinsToday !== 1 ? "s" : ""} today
                        </span>
                      ) : (
                        "Ready for your vote"
                      )}
                    </p>
                  </div>
                </div>

                <div className="w-24 shrink-0 mx-auto sm:mx-0">
                  <VisualJar
                    totalCoins={jarStats.totalCoins}
                    targetCompletions={habit.target_completions}
                    accentColor={accent}
                    size="sm"
                    glowing={glowingId === habit.id}
                  />
                </div>

                <div className="w-full sm:w-44 shrink-0">
                  <AddCoinButton
                    habitName={habit.name}
                    onClick={() => handleAddCoin(habit)}
                    loading={processingId === habit.id}
                    accentColor={accent}
                    completedToday={doneToday}
                    compact
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
