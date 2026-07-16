"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileConfirmSheet } from "@/components/mobile/MobileConfirmSheet";

interface ConfirmDialogProps {
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

export function ConfirmDialog({
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
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <div className="md:hidden">
        <MobileConfirmSheet
          open={open}
          onClose={onClose}
          onConfirm={onConfirm}
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          loading={loading}
          variant={variant}
          details={details}
        />
      </div>

      {open && (
        <dialog
          ref={dialogRef}
          className="hidden md:block fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card-elevated p-0 shadow-card backdrop:bg-black/60 safe-area-pt safe-area-pb"
          onClose={onClose}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-foreground-secondary mb-6">{description}</p>
            {details && details.length > 0 && (
              <div className="mb-6 rounded-xl border border-border bg-card p-4 space-y-3">
                {details.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground-secondary">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-border text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  "min-h-[44px] px-4 py-2 rounded-lg font-medium transition-colors",
                  variant === "danger"
                    ? "bg-negative/20 text-negative hover:bg-negative/30"
                    : "bg-primary text-background hover:bg-primary-hover"
                )}
              >
                {loading ? "Processing..." : confirmLabel}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
