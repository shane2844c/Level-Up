import { getCategoryIcon } from "@/lib/constants";
import { getLevelProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CategorySummary } from "@/lib/types";

interface CategoryProgressCardProps {
  summary: CategorySummary;
}

export function CategoryProgressCard({ summary }: CategoryProgressCardProps) {
  const { category, totalCategoryXp } = summary;
  const progress = getLevelProgress(totalCategoryXp);
  const Icon = getCategoryIcon(category.icon);
  const accentColor = category.accent_color ?? "#58C7FF";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-border/80 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
          <p className="text-sm text-foreground-secondary">
            Level {progress.level} · {progress.tier}
          </p>
        </div>
      </div>

      {progress.isMaxLevel ? (
        <div className="space-y-2">
          <p className="text-sm text-foreground-secondary">
            Level 10 · Master
          </p>
          <p className="text-xs text-muted">Maximum level reached</p>
          <ProgressBar value={100} color={accentColor} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">
              {totalCategoryXp} / {progress.nextLevelThreshold} XP
            </span>
            <span className="text-muted text-xs">
              {progress.xpRemaining} XP until Level {progress.level + 1}
            </span>
          </div>
          <ProgressBar
            value={totalCategoryXp - progress.currentLevelMinXp}
            max={(progress.nextLevelThreshold ?? 0) - progress.currentLevelMinXp}
            color={accentColor}
          />
        </div>
      )}
    </div>
  );
}
