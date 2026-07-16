import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileSectionHeaderProps {
  title: string;
  action?: ReactNode;
  href?: string;
  actionLabel?: string;
  className?: string;
}

export function MobileSectionHeader({
  title,
  action,
  href,
  actionLabel,
  className,
}: MobileSectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-3", className)}>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {action}
      {href && actionLabel && (
        <Link
          href={href}
          className="text-sm text-primary hover:text-primary-hover transition-colors min-h-[44px] inline-flex items-center active:opacity-70"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
