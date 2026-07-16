import { TrendingUp, Layers, Trophy, Calendar } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { ProgressOverviewStats } from "@/lib/types";

interface ProgressSummaryStatsProps {
  stats: ProgressOverviewStats;
}

export function ProgressSummaryStats({ stats }: ProgressSummaryStatsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Lifetime category XP"
        value={stats.lifetimeCategoryXp.toLocaleString()}
        icon={TrendingUp}
        variant="primary"
      />
      <StatCard
        label="XP this week"
        value={`+${stats.weekCategoryXp.toLocaleString()}`}
        icon={Calendar}
        variant="positive"
      />
      <StatCard
        label="Levels gained"
        value={stats.totalLevelsGained}
        icon={Layers}
      />
      <StatCard
        label="Strongest category"
        value={
          stats.strongestCategory
            ? `${stats.strongestCategory.category.name}`
            : "—"
        }
        icon={Trophy}
      />
    </div>
  );
}
