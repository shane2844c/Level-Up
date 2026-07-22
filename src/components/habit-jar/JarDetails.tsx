"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Undo2 } from "lucide-react";
import { VisualJar } from "@/components/habit-jar/VisualJar";
import { AddCoinButton } from "@/components/habit-jar/AddCoinButton";
import { createClient } from "@/lib/supabase/client";
import { reverseHabitTransaction } from "@/lib/data";
import { getJarAccentColor, getJarIdentityStatement } from "@/lib/jar-stats";
import { useToast } from "@/components/ui/Toast";
import { formatRelativeTime } from "@/lib/utils";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";
import { cn } from "@/lib/utils";

interface JarDetailsProps {
  open: boolean;
  onClose: () => void;
  habit: Habit | null;
  stats: HabitJarStats | null;
  onAddCoin: () => void;
  onEdit: () => void;
  adding?: boolean;
  onRemovedCoin?: () => void;
}

export function JarDetails({
  open,
  onClose,
  habit,
  stats,
  onAddCoin,
  onEdit,
  adding = false,
  onRemovedCoin,
}: JarDetailsProps) {
  const [removing, setRemoving] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  if (!open || !habit || !stats) return null;

  const accent = getJarAccentColor(habit);
  const identity = getJarIdentityStatement(habit);

  const handleRemoveLastCoin = async () => {
    if (!stats.latestTransactionId || removing) return;
    setRemoving(true);
    try {
      const supabase = createClient();
      await reverseHabitTransaction(supabase, stats.latestTransactionId);
      showToast("Last coin removed.", "success");
      onRemovedCoin?.();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not remove coin.";
      showToast(message, "error");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <dialog
      open
      onClick={onClose}
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none border-0 bg-black/40 p-0 backdrop:bg-black/40"
      aria-labelledby="jar-details-title"
    >
      <div
        className="habit-jar-page fixed inset-x-0 bottom-0 top-auto max-h-[92dvh] overflow-y-auto rounded-t-3xl shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[90vh] md:w-[min(100%-2rem,560px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl safe-area-pb"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--jar-border)] bg-[var(--jar-surface)] px-5 py-4">
          <h2 id="jar-details-title" className="text-lg font-semibold text-[var(--jar-text)]">
            {habit.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--jar-text-muted)] hover:bg-[var(--jar-surface-muted)]"
            aria-label="Close jar details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          <div className="flex justify-center">
            <VisualJar
              totalCoins={stats.totalCoins}
              targetCompletions={habit.target_completions}
              accentColor={accent}
              size="lg"
            />
          </div>

          {identity && (
            <p className="text-sm italic text-center text-[var(--jar-text-secondary)] px-4">
              &ldquo;{identity}&rdquo;
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <StatBlock label="Total coins" value={String(stats.totalCoins)} />
            <StatBlock label="Current streak" value={`${stats.currentStreak}d`} />
            <StatBlock label="Best streak" value={`${stats.bestStreak}d`} />
          </div>

          <section>
            <h3 className="text-sm font-semibold text-[var(--jar-text)] mb-3">This week</h3>
            <div className="flex items-end justify-between gap-1 h-24 rounded-2xl bg-[var(--jar-surface-muted)] px-3 py-3">
              {stats.weeklyCounts.map((day) => {
                const max = Math.max(...stats.weeklyCounts.map((d) => d.count), 1);
                const height = `${Math.max(8, (day.count / max) * 100)}%`;
                return (
                  <div key={day.dateKey} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-16 w-full items-end justify-center">
                      <div
                        className="w-full max-w-[1.25rem] rounded-t-md transition-all"
                        style={{
                          height,
                          background: `linear-gradient(180deg, ${accent} 0%, ${accent}99 100%)`,
                        }}
                        title={`${day.count} coins`}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--jar-text-muted)]">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--jar-text)] mb-3">Calendar</h3>
            <div className="grid grid-cols-7 gap-1">
              {stats.calendarDays.map((day) => (
                <div
                  key={day.dateKey}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium",
                    day.count > 0
                      ? "text-white"
                      : "bg-[var(--jar-surface-muted)] text-[var(--jar-text-muted)]"
                  )}
                  style={
                    day.count > 0
                      ? {
                          background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                        }
                      : undefined
                  }
                  title={`${day.dateKey}: ${day.count} coins`}
                >
                  {Number(day.dateKey.slice(8, 10))}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--jar-text)] mb-3">Recent coins</h3>
            {stats.recentAdditions.length === 0 ? (
              <p className="text-sm text-[var(--jar-text-muted)]">No coins yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.recentAdditions.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl bg-[var(--jar-surface-muted)] px-3 py-2 text-sm"
                  >
                    <span className="text-[var(--jar-text)]">+1 coin</span>
                    <span className="text-[var(--jar-text-muted)]">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col gap-3 pt-2">
            <AddCoinButton
              habitName={habit.name}
              onClick={onAddCoin}
              loading={adding}
              accentColor={accent}
              completedToday={stats.coinsToday > 0}
            />
            <button
              type="button"
              onClick={handleRemoveLastCoin}
              disabled={!stats.latestTransactionId || removing}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[var(--jar-border)] text-sm font-medium text-[var(--jar-text-secondary)] hover:bg-[var(--jar-surface-muted)] transition-colors disabled:opacity-40"
            >
              <Undo2 className="h-4 w-4" />
              {removing ? "Removing..." : "Remove last coin"}
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="min-h-[44px] rounded-2xl text-sm font-medium text-[var(--jar-text-secondary)] hover:text-[var(--jar-text)]"
            >
              Edit jar
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[var(--jar-surface-muted)] px-3 py-3">
      <p className="text-[11px] text-[var(--jar-text-muted)]">{label}</p>
      <p className="text-lg font-bold text-[var(--jar-text)] mt-0.5">{value}</p>
    </div>
  );
}
