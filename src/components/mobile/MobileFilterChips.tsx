"use client";

import { cn } from "@/lib/utils";

export interface FilterChipOption {
  value: string;
  label: string;
}

interface MobileFilterChipsProps {
  options: FilterChipOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export function MobileFilterChips({
  options,
  value,
  onChange,
  ariaLabel = "Filter options",
}: MobileFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 min-h-[44px] px-4 rounded-full text-sm font-medium transition-colors active:scale-[0.98] motion-reduce:active:scale-100",
              active
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-card border border-border text-foreground-secondary hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
