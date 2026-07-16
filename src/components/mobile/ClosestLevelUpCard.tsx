import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TierBadge } from "@/components/progress/TierBadge";
import { getLevelProgress } from "@/lib/levels";
import type { CategorySummary } from "@/lib/types";

interface ClosestLevelUpCardProps {
  summaries: CategorySummary[];
}

export function ClosestLevelUpCard({ summaries }: ClosestLevelUpCardProps) {
  const active = summaries
    .filter((s) => s.category.is_active)
    .map((s) => ({
      summary: s,
      progress: getLevelProgress(s.totalCategoryXp),
    }))
    .filter((item) => !item.progress.isMaxLevel)
    .sort((a, b) => a.progress.xpRemaining - b.progress.xpRemaining);

  const closest = active[0];
  if (!closest) return null;

  const { summary, progress } = closest;
  const accent = summary.category.accent_color ?? "#58C7FF";

  return (
    <Link
      href={`/progress/${summary.category.id}`}
      className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-card-elevated active:opacity-90"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm font-medium text-foreground-secondary">
          Closest level-up
        </p>
        <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
      </div>

      <div className="flex items-start gap-3 mb-4">
        <TierBadge
          tier={progress.tier}
          iconId={summary.category.icon}
          accentColor={accent}
          size="md"
        />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {summary.category.name}
          </h3>
          <p className="text-sm text-foreground-secondary mt-0.5">
            Level {progress.level} · {progress.tier}
          </p>
        </div>
      </div>

      <ProgressBar
        value={progress.xpInLevel}
        max={progress.xpRequiredInLevel}
        color={accent}
      />
      <p className="text-sm text-muted mt-2">
        {progress.xpRemaining} XP until Level {progress.level + 1}
      </p>
    </Link>
  );
}
