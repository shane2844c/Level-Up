import { getCategoryIcon } from "@/lib/constants";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CategoryXpShare } from "@/lib/types";

interface CategoryXpBreakdownProps {
  breakdown: CategoryXpShare[];
}

export function CategoryXpBreakdown({ breakdown }: CategoryXpBreakdownProps) {
  const hasXp = breakdown.some((b) => b.xp > 0);

  if (!hasXp) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Category XP breakdown
        </h2>
        <p className="text-sm text-muted text-center py-6">
          Log good habits to see how XP is distributed across categories.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground mb-5">
        Category XP breakdown
      </h2>
      <div className="space-y-4">
        {breakdown.map(({ category, xp, percentage }) => {
          const Icon = getCategoryIcon(category.icon);
          const accent = category.accent_color ?? "#58C7FF";
          return (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <span className="text-sm font-medium text-foreground truncate">
                    {category.name}
                  </span>
                </div>
                <div className="text-sm text-foreground-secondary shrink-0 ml-2">
                  {xp.toLocaleString()} XP · {percentage}%
                </div>
              </div>
              <ProgressBar value={percentage} max={100} color={accent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
