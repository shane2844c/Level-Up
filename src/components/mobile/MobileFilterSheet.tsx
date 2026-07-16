"use client";

import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import type { ReactNode } from "react";

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  onApply?: () => void;
  onClear?: () => void;
}

export function MobileFilterSheet({
  open,
  onClose,
  title = "Filters",
  children,
  onApply,
  onClear,
}: MobileFilterSheetProps) {
  return (
    <MobileBottomSheet open={open} onClose={onClose} title={title} ariaLabel="Filters">
      <div className="px-4 pb-4 space-y-5 max-h-[70dvh] overflow-y-auto">
        {children}
        <div className="flex flex-col gap-3 pt-2">
          {onApply && (
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="min-h-[48px] w-full rounded-xl bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors active:opacity-80"
            >
              Apply filters
            </button>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="min-h-[48px] w-full rounded-xl border border-border text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors active:opacity-80"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </MobileBottomSheet>
  );
}
