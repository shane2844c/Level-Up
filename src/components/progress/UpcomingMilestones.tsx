import Link from "next/link";
import { getCategoryIcon } from "@/lib/constants";
import { getLevelProgress } from "@/lib/levels";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { UpcomingMilestone } from "@/lib/types";
import { Target } from "lucide-react";

interface UpcomingMilestonesProps {
  milestones: UpcomingMilestone[];
}

export function UpcomingMilestones({ milestones }: UpcomingMilestonesProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Upcoming milestones
      </h2>

      {milestones.length === 0 ? (
        <div className="text-center py-6">
          <Target className="h-8 w-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            All categories have reached maximum level, or no active categories exist.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {milestones.map((m) => {
            const Icon = getCategoryIcon(m.category.icon);
            const accent = m.category.accent_color ?? "#58C7FF";
            const progress = getLevelProgress(m.totalXp);

            return (
              <li key={m.category.id}>
                <Link
                  href={`/progress/${m.category.id}`}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <span className="text-sm font-medium text-foreground truncate">
                        {m.category.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted shrink-0 ml-2">
                      Lv.{m.currentLevel} → Lv.{m.nextLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span>{m.xpRemaining} XP remaining</span>
                    <span>
                      {progress.xpInLevel} / {progress.xpRequiredInLevel} XP
                    </span>
                  </div>
                  <ProgressBar
                    value={progress.xpInLevel}
                    max={progress.xpRequiredInLevel}
                    color={accent}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
