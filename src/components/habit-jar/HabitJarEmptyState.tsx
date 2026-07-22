"use client";

import { JarCoin } from "@/components/habit-jar/JarCoin";

interface HabitJarEmptyStateProps {
  onCreateJar: () => void;
  canCreate: boolean;
}

export function HabitJarEmptyState({ onCreateJar, canCreate }: HabitJarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--jar-border)] bg-[var(--jar-surface)] px-6 py-16 text-center shadow-sm">
      <div
        className="relative mb-6 h-32 w-24 rounded-[1.5rem] border-2 border-white/70 bg-gradient-to-b from-white/50 to-[#58C7FF]/10 shadow-inner"
        aria-hidden="true"
      >
        <div className="absolute inset-x-3 top-2 h-2.5 rounded-full bg-white/60" />
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 pb-3 opacity-40">
          <JarCoin size="sm" />
          <JarCoin size="sm" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-[var(--jar-text)]">
        Create your first habit jar
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--jar-text-secondary)] leading-relaxed">
        Each time you complete a habit, add one coin. Watch your jars fill up as you
        become the person you want to be.
      </p>

      {canCreate ? (
        <button
          type="button"
          onClick={onCreateJar}
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#58C7FF] to-[#7DD6FF] px-6 text-sm font-semibold text-white shadow-lg shadow-[#58C7FF]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Create Jar
        </button>
      ) : (
        <p className="mt-6 text-sm text-[var(--jar-text-muted)]">
          Create a category in Settings first, then return here to create a jar.
        </p>
      )}
    </div>
  );
}
