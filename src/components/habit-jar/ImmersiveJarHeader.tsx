"use client";

import { Plus, Sparkles } from "lucide-react";

interface ImmersiveJarHeaderProps {
  greeting: string;
  onCreateJar: () => void;
  canCreate: boolean;
}

export function ImmersiveJarHeader({
  greeting,
  onCreateJar,
  canCreate,
}: ImmersiveJarHeaderProps) {
  return (
    <header className="mb-3 md:mb-8 animate-fade-in">
      <div className="flex items-center justify-between gap-3 md:items-start md:gap-4">
        <div className="min-w-0 max-w-xl">
          <p className="text-xs md:text-sm font-medium text-[var(--jar-text-secondary)] flex items-center gap-1.5 md:gap-2">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#f59e0b]" aria-hidden="true" />
            {greeting}
          </p>
          <h1 className="text-xl md:text-3xl font-bold text-[var(--jar-text)] mt-0.5 md:mt-1 tracking-tight truncate">
            My Habit Jars
          </h1>
          <p className="hidden md:block text-base text-[var(--jar-text-secondary)] mt-2 leading-relaxed max-w-md">
            Every coin is a vote for who you&apos;re becoming.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateJar}
          disabled={!canCreate}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-[var(--jar-border)] bg-white/80 px-3 py-2 md:px-4 md:py-2.5 text-sm font-semibold text-[var(--jar-text-secondary)] shadow-sm transition-all hover:bg-white hover:text-[var(--jar-text)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Jar</span>
        </button>
      </div>
    </header>
  );
}
