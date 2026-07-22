"use client";

import { Flame, Coins } from "lucide-react";
import type { HabitJarStats } from "@/lib/jar-stats";
import { cn } from "@/lib/utils";

interface JarStatsProps {
  stats: HabitJarStats;
  accentColor: string;
  compact?: boolean;
}

export function JarStats({ stats, accentColor, compact = false }: JarStatsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "gap-6" : "gap-8 md:gap-12"
      )}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 text-[var(--jar-text-muted)] mb-0.5">
          <Coins className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
          <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide">
            Total coins
          </span>
        </div>
        <p
          className={cn(
            "font-bold tabular-nums tracking-tight",
            compact ? "text-3xl" : "text-4xl md:text-5xl"
          )}
          style={{ color: accentColor }}
        >
          {stats.totalCoins}
        </p>
      </div>

      <div className="h-10 w-px bg-[var(--jar-border)] md:h-12" aria-hidden="true" />

      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 text-[var(--jar-text-muted)] mb-0.5">
          <Flame className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
          <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide">
            Streak
          </span>
        </div>
        <p
          className={cn(
            "font-bold tabular-nums text-[var(--jar-text)]",
            compact ? "text-3xl" : "text-4xl md:text-5xl"
          )}
        >
          {stats.currentStreak}
          <span className="text-base font-semibold text-[var(--jar-text-muted)] ml-1 md:text-lg">
            days
          </span>
        </p>
      </div>
    </div>
  );
}
