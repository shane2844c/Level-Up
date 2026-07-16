import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileSettingsGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function MobileSettingsGroup({
  title,
  children,
  className,
}: MobileSettingsGroupProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

interface MobileSettingsRowProps {
  label: string;
  value?: string;
  children?: ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  className?: string;
}

export function MobileSettingsRow({
  label,
  value,
  children,
  className,
}: MobileSettingsRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-[48px] items-center justify-between gap-3 px-4 py-3",
        className
      )}
    >
      <span className="text-sm text-foreground-secondary shrink-0">{label}</span>
      {children ?? (
        <span className="text-sm text-foreground text-right truncate">{value}</span>
      )}
    </div>
  );
}
