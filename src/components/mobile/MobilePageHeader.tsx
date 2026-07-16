"use client";

import Link from "next/link";
import { ChevronLeft, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
  showSettings?: boolean;
  className?: string;
}

export function MobilePageHeader({
  title,
  subtitle,
  action,
  backHref,
  showSettings = false,
  className,
}: MobilePageHeaderProps) {
  return (
    <header
      className={cn(
        "md:hidden flex items-start justify-between gap-3 mb-6 safe-area-pt -mt-2",
        className
      )}
    >
      <div className="flex items-start gap-2 min-w-0 flex-1">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground-secondary hover:text-foreground hover:bg-card transition-colors active:opacity-70"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-foreground-secondary mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        {showSettings && (
          <Link
            href="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground-secondary hover:text-primary hover:border-primary/30 transition-colors active:opacity-70"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
