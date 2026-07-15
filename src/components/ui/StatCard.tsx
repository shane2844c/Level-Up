import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "positive" | "negative" | "primary";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  const valueColors = {
    default: "text-foreground",
    positive: "text-positive",
    negative: "text-negative",
    primary: "text-primary text-glow",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background-secondary p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="h-4 w-4 text-muted" />}
        <span className="text-xs text-foreground-secondary uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={cn("text-xl font-semibold", valueColors[variant])}>{value}</p>
    </div>
  );
}
