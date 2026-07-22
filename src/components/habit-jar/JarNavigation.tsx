"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JarNavigationProps {
  count: number;
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  jarNames: string[];
  compact?: boolean;
}

export function JarNavigation({
  count,
  activeIndex,
  onPrevious,
  onNext,
  onSelect,
  jarNames,
  compact = false,
}: JarNavigationProps) {
  if (count <= 1) {
    return count === 1 ? (
      <div className={cn("flex justify-center", compact ? "pt-0" : "pt-6")} aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-indigo-500" />
      </div>
    ) : null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        compact ? "pt-0" : "pt-6 md:pt-8"
      )}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={activeIndex === 0}
        className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-[var(--jar-border)] bg-white text-[var(--jar-text-secondary)] shadow-sm transition-all hover:bg-[var(--jar-surface-muted)] hover:text-[var(--jar-text)] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Previous jar"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        className="flex items-center gap-2"
        role="tablist"
        aria-label="Habit jars"
      >
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`${jarNames[index] ?? `Jar ${index + 1}`}${index === activeIndex ? ", current" : ""}`}
            onClick={() => onSelect(index)}
            className={cn(
              "rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
              index === activeIndex
                ? "h-2.5 w-8 bg-indigo-500"
                : "h-2 w-2 bg-[var(--jar-border)] hover:bg-indigo-300"
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={activeIndex >= count - 1}
        className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-[var(--jar-border)] bg-white text-[var(--jar-text-secondary)] shadow-sm transition-all hover:bg-[var(--jar-surface-muted)] hover:text-[var(--jar-text)] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Next jar"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
