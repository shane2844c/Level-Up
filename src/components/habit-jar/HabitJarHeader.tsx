"use client";

import { Plus } from "lucide-react";
import type { JarDashboardStats } from "@/lib/jar-stats";

interface HabitJarHeaderProps {
  greeting: string;
  stats: JarDashboardStats;
  onCreateJar: () => void;
  canCreate: boolean;
}

export function HabitJarHeader({
  greeting,
  stats,
  onCreateJar,
  canCreate,
}: HabitJarHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--jar-text-secondary)]">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--jar-text)] mt-1 tracking-tight">
            Habit Jars
          </h1>
          <p className="text-sm text-[var(--jar-text-secondary)] mt-2 max-w-md leading-relaxed">
            Every coin is a vote for who you&apos;re becoming.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateJar}
          disabled={!canCreate}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#58C7FF] to-[#7DD6FF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#58C7FF]/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Jar
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[var(--jar-border)] bg-[var(--jar-surface)] px-4 py-3 shadow-sm">
          <p className="text-xs text-[var(--jar-text-muted)]">Today</p>
          <p className="text-xl font-bold text-[var(--jar-text)] mt-0.5">
            {stats.coinsToday}
            <span className="text-sm font-medium text-[var(--jar-text-secondary)] ml-1">
              {stats.coinsToday === 1 ? "coin" : "coins"}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--jar-border)] bg-[var(--jar-surface)] px-4 py-3 shadow-sm">
          <p className="text-xs text-[var(--jar-text-muted)]">This week</p>
          <p className="text-xl font-bold text-[var(--jar-text)] mt-0.5">
            {stats.coinsThisWeek}
            <span className="text-sm font-medium text-[var(--jar-text-secondary)] ml-1">coins</span>
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--jar-border)] bg-[var(--jar-surface)] px-4 py-3 shadow-sm">
          <p className="text-xs text-[var(--jar-text-muted)]">Active jars</p>
          <p className="text-xl font-bold text-[var(--jar-text)] mt-0.5">
            {stats.activeJarCount}
          </p>
        </div>
      </div>
    </header>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export { getGreeting };
