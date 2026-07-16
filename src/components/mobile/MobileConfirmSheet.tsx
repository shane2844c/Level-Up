"use client";

import { useEffect } from "react";
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import { cn } from "@/lib/utils";

interface MobileConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "default" | "danger";
  details?: { label: string; value: string }[];
}

export function MobileConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  variant = "default",
  details,
}: MobileConfirmSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  return (
    <MobileBottomSheet open={open} onClose={onClose} title={title} ariaLabel={title}>
      <div className="px-4 pb-4">
        <p className="text-sm text-foreground-secondary leading-relaxed">{description}</p>

        {details && details.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-3">
            {details.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-foreground-secondary">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "min-h-[48px] w-full rounded-xl text-sm font-medium transition-colors active:opacity-80",
              variant === "danger"
                ? "bg-negative/20 text-negative hover:bg-negative/30"
                : "bg-primary text-background hover:bg-primary-hover"
            )}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[48px] w-full rounded-xl border border-border text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-card transition-colors active:opacity-80"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </MobileBottomSheet>
  );
}
