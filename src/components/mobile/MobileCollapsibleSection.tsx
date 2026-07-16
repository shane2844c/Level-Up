"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function MobileCollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
}: MobileCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn("md:hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full min-h-[48px] items-center justify-between gap-3 mb-3 active:opacity-80"
      >
        <h2 className="text-lg font-semibold text-foreground text-left">{title}</h2>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted transition-transform motion-reduce:transition-none",
            open && "rotate-180"
          )}
        />
      </button>
      {open && children}
    </section>
  );
}
