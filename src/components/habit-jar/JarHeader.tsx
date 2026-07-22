"use client";

import { MoreHorizontal } from "lucide-react";
import { getJarAccentColor, getJarIcon, getJarIdentityStatement } from "@/lib/jar-stats";
import type { Habit } from "@/lib/types";

interface JarHeaderProps {
  habit: Habit;
  onOpenMenu: () => void;
  compact?: boolean;
}

export function JarHeader({ habit, onOpenMenu, compact = false }: JarHeaderProps) {
  const accent = getJarAccentColor(habit);
  const icon = getJarIcon(habit);
  const identity = getJarIdentityStatement(habit);

  return (
    <div
      className={
        compact
          ? "flex items-start justify-between gap-3 px-1 mb-3"
          : "flex w-full max-w-lg items-start justify-between gap-3 mb-4"
      }
    >
      <div className="flex min-w-0 items-start gap-2.5 md:gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl md:h-12 md:w-12 md:rounded-2xl md:text-2xl shadow-sm"
          style={{ backgroundColor: `${accent}18` }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--jar-text)] truncate md:text-2xl">
            {habit.name}
          </h2>
          {identity && (
            <p className="mt-0.5 text-xs text-[var(--jar-text-secondary)] italic line-clamp-2 md:text-sm">
              {identity}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--jar-text-muted)] active:bg-white/80 md:hover:bg-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label={`Options for ${habit.name}`}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
