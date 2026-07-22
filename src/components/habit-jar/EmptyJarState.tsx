"use client";

import { JarCoin } from "@/components/habit-jar/JarCoin";

interface EmptyJarStateProps {
  onCreateJar: () => void;
  canCreate: boolean;
}

export function EmptyJarState({ onCreateJar, canCreate }: EmptyJarStateProps) {
  return (
    <section className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--jar-border)] bg-white/80 px-6 py-20 text-center shadow-sm">
      <div className="relative mb-8" aria-hidden="true">
        <div className="h-40 w-28 rounded-[2rem] rounded-b-[2.5rem] border-2 border-white/80 bg-gradient-to-b from-white/60 to-indigo-100/40 shadow-inner mx-auto">
          <div className="absolute inset-x-4 top-2 h-2.5 rounded-full bg-white/70" />
        </div>
        <div className="absolute -top-2 right-0 animate-float-slow">
          <JarCoin size="sm" />
        </div>
        <div className="absolute top-8 -left-4 animate-float-medium">
          <JarCoin size="md" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[var(--jar-text)]">
        Create your first habit jar
      </h2>
      <p className="mt-3 max-w-md text-sm text-[var(--jar-text-secondary)] leading-relaxed">
        Every time you complete a habit, add one coin. Over time, your jar becomes
        visible proof of who you are becoming.
      </p>

      {canCreate ? (
        <button
          type="button"
          onClick={onCreateJar}
          className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Create My First Jar
        </button>
      ) : (
        <p className="mt-6 text-sm text-[var(--jar-text-muted)]">
          Create a category in Settings first, then return here.
        </p>
      )}
    </section>
  );
}
