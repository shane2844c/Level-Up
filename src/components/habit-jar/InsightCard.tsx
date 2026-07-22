import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: string;
  className?: string;
}

export function InsightCard({ title, value, subtitle, accent, className }: InsightCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/80 bg-white p-5 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--jar-text-muted)]">
        {title}
      </p>
      <p
        className="mt-2 text-3xl font-bold tabular-nums"
        style={{ color: accent ?? "var(--jar-text)" }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--jar-text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
