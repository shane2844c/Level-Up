"use client";

import { VisualJar } from "@/components/habit-jar/VisualJar";
import { AddCoinButton } from "@/components/habit-jar/AddCoinButton";
import { getJarAccentColor, getJarIcon, getJarIdentityStatement } from "@/lib/jar-stats";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";

interface HabitJarCardProps {
  habit: Habit;
  stats: HabitJarStats;
  onAddCoin: () => void;
  onOpenMenu: () => void;
  onOpenDetails: () => void;
  adding?: boolean;
  glowing?: boolean;
  isNew?: boolean;
  jarRef?: React.Ref<HTMLButtonElement>;
  addButtonRef?: React.Ref<HTMLButtonElement>;
}

export function HabitJarCard({
  habit,
  stats,
  onAddCoin,
  onOpenMenu,
  onOpenDetails,
  adding = false,
  glowing = false,
  isNew = false,
  jarRef,
  addButtonRef,
}: HabitJarCardProps) {
  const accent = getJarAccentColor(habit);
  const icon = getJarIcon(habit);
  const identity = getJarIdentityStatement(habit);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[1.75rem] border border-white/80 bg-white/90 p-5",
        "shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]",
        glowing && "animate-jar-glow",
        isNew && "animate-jar-enter"
      )}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={onOpenDetails}
          className="flex min-w-0 flex-1 items-start gap-3 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ outlineColor: accent }}
          aria-label={`View details for ${habit.name}`}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ backgroundColor: `${accent}18` }}
            aria-hidden="true"
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[var(--jar-text)] truncate">
              {habit.name}
            </h3>
            {identity && (
              <p className="text-xs text-[var(--jar-text-muted)] mt-1 line-clamp-2 italic">
                {identity}
              </p>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--jar-text-muted)] hover:bg-[var(--jar-surface-muted)] transition-colors"
          aria-label={`Options for ${habit.name}`}
        >
          <span className="text-xl leading-none">⋯</span>
        </button>
      </div>

      <VisualJar
        totalCoins={stats.totalCoins}
        targetCompletions={habit.target_completions}
        accentColor={accent}
        size="md"
        glowing={glowing}
        interactive
        jarRef={jarRef}
        onClick={onOpenDetails}
        ariaLabel={`${habit.name} jar with ${stats.totalCoins} coins`}
      />

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <div>
          <p className="text-[var(--jar-text-muted)] text-xs">Total coins</p>
          <p className="text-2xl font-bold text-[var(--jar-text)] tabular-nums">
            {stats.totalCoins}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[var(--jar-text-muted)] text-xs">Streak</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: accent }}>
            {stats.currentStreak}d
          </p>
        </div>
      </div>

      <AddCoinButton
        ref={addButtonRef}
        habitName={habit.name}
        onClick={onAddCoin}
        loading={adding}
        accentColor={accent}
        completedToday={stats.coinsToday > 0}
        className="mt-4"
      />
    </article>
  );
}
