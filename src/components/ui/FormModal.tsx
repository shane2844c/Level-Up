"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function FormModal({ open, onClose, title, children }: FormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 p-0 border-0 bg-transparent backdrop:bg-black/60",
        "max-md:overflow-hidden"
      )}
      onClose={onClose}
    >
      <div
        className={cn(
          "bg-card-elevated border border-border shadow-card overflow-y-auto",
          "md:m-auto md:w-[calc(100%-2rem)] md:max-w-lg md:rounded-2xl md:max-h-[min(90vh,calc(100dvh-2rem))]",
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-h-[92dvh] max-md:rounded-t-2xl max-md:w-full",
          "safe-area-pt safe-area-pb"
        )}
      >
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        </div>
        <div className="px-5 pb-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-card transition-colors active:opacity-70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </dialog>
  );
}
