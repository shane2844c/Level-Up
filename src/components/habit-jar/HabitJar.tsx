"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { JarCoinsDisplay } from "@/components/habit-jar/JarCoinsDisplay";
import { getJarAccentColor, getJarIcon } from "@/lib/jar-stats";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";

interface HabitJarProps {
  habit: Habit;
  stats: HabitJarStats;
  onAddCoin: () => void;
  onOpenMenu: () => void;
  onOpenDetails: () => void;
  adding?: boolean;
  glowing?: boolean;
  className?: string;
  large?: boolean;
  jarRef?: React.Ref<HTMLButtonElement>;
  addButtonRef?: React.Ref<HTMLButtonElement>;
  visualOnly?: boolean;
}

export function HabitJar({
  habit,
  stats,
  onAddCoin,
  onOpenMenu,
  onOpenDetails,
  adding = false,
  glowing = false,
  className,
  large = false,
  jarRef,
  addButtonRef,
  visualOnly = false,
}: HabitJarProps) {
  const accent = getJarAccentColor(habit);
  const icon = getJarIcon(habit);

  return (
    <article
      className={cn(
        visualOnly
          ? "relative flex flex-col items-center"
          : "group relative flex flex-col rounded-3xl border border-[var(--jar-border)] bg-[var(--jar-surface)] p-4 shadow-[var(--jar-shadow)] transition-transform hover:-translate-y-0.5",
        glowing && "animate-jar-glow",
        className
      )}
      style={visualOnly ? undefined : { borderTopColor: accent, borderTopWidth: 3 }}
    >
      {!visualOnly && (
        <div className="flex items-start justify-between gap-2 mb-3 w-full">
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex min-w-0 flex-1 items-start gap-2 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ outlineColor: accent }}
            aria-label={`View details for ${habit.name}`}
          >
            <span className="text-2xl leading-none shrink-0" aria-hidden="true">
              {icon}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--jar-text)] truncate">
                {habit.name}
              </h3>
              <p className="text-xs text-[var(--jar-text-muted)] mt-0.5">
                {stats.totalCoins} {stats.totalCoins === 1 ? "coin" : "coins"}
                {stats.currentStreak > 0 && ` · ${stats.currentStreak} day streak`}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--jar-text-muted)] hover:bg-[var(--jar-surface-muted)] hover:text-[var(--jar-text)] transition-colors"
            aria-label={`Options for ${habit.name}`}
          >
            <span className="text-lg leading-none">⋯</span>
          </button>
        </div>
      )}

      {visualOnly ? (
        <div
          className={cn(
            "relative mx-auto w-full rounded-[1.75rem] border-2 border-white/60 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-sm overflow-hidden",
            large ? "h-56 max-w-[220px]" : "h-40 max-w-[180px]"
          )}
          style={{
            boxShadow: `inset 0 2px 12px rgba(255,255,255,0.8), inset 0 -8px 16px ${accent}22, 0 4px 16px ${accent}18`,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-x-3 top-2 h-3 rounded-full bg-white/50"
            aria-hidden="true"
          />
          <JarCoinsDisplay
            totalCoins={stats.totalCoins}
            targetCompletions={habit.target_completions}
            accentColor={accent}
            compact={!large}
          />
        </div>
      ) : (
        <button
          type="button"
          ref={jarRef}
          onClick={onOpenDetails}
          className={cn(
            "relative mx-auto w-full rounded-[1.75rem] border-2 border-white/60 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-sm overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            large ? "h-56 max-w-[220px]" : "h-40 max-w-[180px]"
          )}
          style={{
            boxShadow: `inset 0 2px 12px rgba(255,255,255,0.8), inset 0 -8px 16px ${accent}22, 0 4px 16px ${accent}18`,
            outlineColor: accent,
          }}
          aria-label={`${habit.name} jar with ${stats.totalCoins} coins`}
        >
          <div
            className="absolute inset-x-3 top-2 h-3 rounded-full bg-white/50"
            aria-hidden="true"
          />
          <JarCoinsDisplay
            totalCoins={stats.totalCoins}
            targetCompletions={habit.target_completions}
            accentColor={accent}
            compact={!large}
          />
        </button>
      )}

      {!visualOnly && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs w-full">
            <div className="rounded-xl bg-[var(--jar-surface-muted)] px-2 py-2">
              <p className="text-[var(--jar-text-muted)]">Total</p>
              <p className="font-semibold text-[var(--jar-text)]">{stats.totalCoins}</p>
            </div>
            <div className="rounded-xl bg-[var(--jar-surface-muted)] px-2 py-2">
              <p className="text-[var(--jar-text-muted)]">Streak</p>
              <p className="font-semibold text-[var(--jar-text)]">{stats.currentStreak}d</p>
            </div>
          </div>

          <AddCoinButton
            ref={addButtonRef}
            habitName={habit.name}
            onClick={onAddCoin}
            loading={adding}
            accentColor={accent}
            className="mt-3"
          />
        </>
      )}
    </article>
  );
}

interface AddCoinButtonProps {
  habitName: string;
  onClick: () => void;
  loading?: boolean;
  accentColor?: string;
  className?: string;
}

export const AddCoinButton = forwardRef<HTMLButtonElement, AddCoinButtonProps>(
  function AddCoinButton(
    { habitName, onClick, loading = false, accentColor = "#58C7FF", className },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        disabled={loading}
        className={cn(
          "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:active:scale-100 shadow-md",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
        }}
        aria-label={`Add coin for ${habitName}`}
      >
        {loading ? (
          "Adding..."
        ) : (
          <>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f5c542] text-[10px] text-[#7a5a00] font-bold shadow-sm">
              +
            </span>
            Add Coin
          </>
        )}
      </button>
    );
  }
);
