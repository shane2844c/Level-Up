"use client";

import { cn } from "@/lib/utils";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface MobileSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function MobileSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Filter",
}: MobileSegmentedControlProps<T>) {
  return (
    <div
      className="flex rounded-xl border border-border bg-background-secondary p-1"
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
              "flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors active:opacity-80",
              active
                ? "bg-card text-primary shadow-sm"
                : "text-foreground-secondary hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
