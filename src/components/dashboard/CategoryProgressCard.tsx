import Link from "next/link";
import { getLevelProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TierBadge } from "@/components/progress/TierBadge";
import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/lib/types";
import type { ExpandedCategoryProgress } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface CategoryProgressCardProps {
  summary: CategorySummary | ExpandedCategoryProgress;
  expanded?: boolean;
  href?: string;
}

function isExpanded(
  summary: CategorySummary | ExpandedCategoryProgress
): summary is ExpandedCategoryProgress {
  return "weekXp" in summary;
}

export function CategoryProgressCard({
  summary,
  expanded = false,
  href,
}: CategoryProgressCardProps) {
  const { category, totalCategoryXp } = summary;
  const progress = getLevelProgress(totalCategoryXp);
  const accentColor = category.accent_color ?? "#58C7FF";

  const content = (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 transition-colors",
        href && "hover:border-primary/30 hover:bg-card-elevated",
        expanded && "p-6"
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <TierBadge
          tier={progress.tier}
          iconId={category.icon}
          accentColor={accentColor}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
          <p className="text-sm text-foreground-secondary">
            Level {progress.level} · {progress.tier}
          </p>
        </div>
        {href && (
          <ChevronRight className="h-5 w-5 text-muted shrink-0 mt-0.5" />
        )}
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

      <p className="text-xs text-muted mt-3">
        {totalCategoryXp.toLocaleString()} permanent XP
      </p>

      {expanded && isExpanded(summary) && (
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">This week</p>
            <p className="text-sm font-medium text-positive mt-0.5">+{summary.weekXp} XP</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Completions</p>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {summary.goodCompletions}
            </p>
          </div>
          {summary.topHabit && (
            <div className="col-span-2">
              <p className="text-xs text-muted uppercase tracking-wide">Top habit</p>
              <p className="text-sm text-foreground-secondary mt-0.5 truncate">
                {summary.topHabit.name}{" "}
                <span className="text-positive">+{summary.topHabit.xp} XP</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
