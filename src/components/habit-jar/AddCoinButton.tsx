"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AddCoinButtonProps {
  habitName: string;
  onClick: () => void;
  loading?: boolean;
  accentColor?: string;
  className?: string;
  completedToday?: boolean;
  compact?: boolean;
}

export const AddCoinButton = forwardRef<HTMLButtonElement, AddCoinButtonProps>(
  function AddCoinButton(
    {
      habitName,
      onClick,
      loading = false,
      accentColor = "#58C7FF",
      className,
      completedToday = false,
      compact = false,
    },
    ref
  ) {
    const label = completedToday ? "Add Another Coin" : "Add Coin";

    return (
      <button
        ref={ref}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white transition-all",
          "shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          compact ? "min-h-[44px] text-sm" : "min-h-[56px] md:min-h-[52px] text-sm md:text-base",
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
          outlineColor: accentColor,
        }}
        aria-label={`Add one coin to ${habitName}`}
      >
        {loading ? (
          "Adding..."
        ) : (
          <>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f5c542] text-[11px] font-bold text-[#7a5a00] shadow-sm">
              +
            </span>
            {label}
          </>
        )}
      </button>
    );
  }
);
