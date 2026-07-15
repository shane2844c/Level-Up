import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-border bg-card",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-secondary mb-4">
        <Icon className="h-7 w-7 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-secondary max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
