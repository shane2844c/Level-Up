"use client";

import { Plus, Sparkles } from "lucide-react";
import { JarCoin } from "@/components/habit-jar/JarCoin";
import type { JarDashboardStats } from "@/lib/jar-stats";

interface DashboardHeroProps {
  greeting: string;
  stats: JarDashboardStats;
  onCreateJar: () => void;
  canCreate: boolean;
}

export function DashboardHero({
  greeting,
  stats,
  onCreateJar,
  canCreate,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#eff6ff] p-6 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] mb-8 animate-fade-in">
      <div className="absolute top-4 right-8 opacity-30 pointer-events-none" aria-hidden="true">
        <JarCoin size="lg" />
      </div>
      <div className="absolute top-16 right-24 opacity-20 pointer-events-none hidden sm:block" aria-hidden="true">
        <JarCoin size="md" />
      </div>
      <div className="absolute bottom-6 right-12 opacity-25 pointer-events-none hidden md:block" aria-hidden="true">
        <JarCoin size="sm" />
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-[var(--jar-text-secondary)] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#f59e0b]" aria-hidden="true" />
            {greeting}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--jar-text)] mt-2 tracking-tight">
            My Habit Jars
          </h1>
          <p className="text-base text-[var(--jar-text-secondary)] mt-3 leading-relaxed">
            Every coin is a vote for who you&apos;re becoming.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-[var(--jar-text)]">
              <strong className="text-lg font-bold text-[#f59e0b]">{stats.coinsToday}</strong>
              <span className="text-[var(--jar-text-secondary)] ml-1.5">coins today</span>
            </span>
            <span className="hidden sm:inline text-[var(--jar-border)]">·</span>
            <span className="text-[var(--jar-text)]">
              <strong className="text-lg font-bold text-[#8b5cf6]">{stats.coinsThisWeek}</strong>
              <span className="text-[var(--jar-text-secondary)] ml-1.5">this week</span>
            </span>
            <span className="hidden sm:inline text-[var(--jar-border)]">·</span>
            <span className="text-[var(--jar-text)]">
              <strong className="text-lg font-bold text-[#10b981]">{stats.activeJarCount}</strong>
              <span className="text-[var(--jar-text-secondary)] ml-1.5">active jars</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateJar}
          disabled={!canCreate}
          className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create New Jar
        </button>
      </div>
    </section>
  );
}
