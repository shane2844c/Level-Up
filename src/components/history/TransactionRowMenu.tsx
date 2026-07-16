"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionRowMenuProps {
  onRemove: () => void;
  disabled?: boolean;
}

export function TransactionRowMenu({ onRemove, disabled }: TransactionRowMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        className={cn(
          "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted transition-colors",
          "hover:text-foreground hover:bg-background-secondary active:opacity-80",
          disabled && "opacity-50 pointer-events-none"
        )}
        aria-label="Activity options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-xl border border-border bg-card-elevated p-1 shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors active:opacity-80"
          >
            <Trash2 className="h-4 w-4 text-muted" />
            Remove activity
          </button>
        </div>
      )}
    </div>
  );
}
