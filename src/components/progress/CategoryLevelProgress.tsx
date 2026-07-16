import { getLevelProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TierBadge } from "@/components/progress/TierBadge";
import type { Category } from "@/lib/types";

interface CategoryLevelProgressProps {
  category: Category;
  totalCategoryXp: number;
  showTotalXp?: boolean;
  accentColor?: string;
}

export function CategoryLevelProgress({
  category,
  totalCategoryXp,
  showTotalXp = true,
  accentColor = category.accent_color ?? "#58C7FF",
}: CategoryLevelProgressProps) {
  const progress = getLevelProgress(totalCategoryXp);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <TierBadge
          tier={progress.tier}
          iconId={category.icon}
          accentColor={accentColor}
          size="md"
        />
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
          <p className="text-sm text-foreground-secondary">
            Level {progress.level} · {progress.tier}
          </p>
        </div>
      </div>

      {progress.isMaxLevel ? (
        <div className="space-y-2">
          <p className="text-sm text-foreground-secondary">Level 10 · Master</p>
          <p className="text-xs text-muted">Maximum level reached</p>
          <ProgressBar value={100} color={accentColor} />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-foreground-secondary">
            {progress.xpInLevel} / {progress.xpRequiredInLevel} XP
          </p>
          <ProgressBar
            value={progress.xpInLevel}
            max={progress.xpRequiredInLevel}
            color={accentColor}
          />
          <p className="text-xs text-muted">
            {progress.xpRemaining} XP until Level {progress.level + 1}
          </p>
        </div>
      )}

      {showTotalXp && (
        <p className="text-xs text-muted">
          {totalCategoryXp.toLocaleString()} permanent XP
        </p>
      )}
    </div>
  );
}
