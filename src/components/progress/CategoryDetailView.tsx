"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TierBadge } from "@/components/progress/TierBadge";
import { StatCard } from "@/components/ui/StatCard";
import { XpGrowthChart } from "@/components/progress/XpGrowthChart";
import { HabitContributionSection } from "@/components/progress/HabitContribution";
import { LevelUpTimeline } from "@/components/progress/LevelUpTimeline";
import { TransactionList } from "@/components/history/TransactionList";
import type {
  CategoryDetailStats,
  CategoryLevelEvent,
  ChartDataPoint,
  HabitContribution,
  XpTransaction,
} from "@/lib/types";

interface CategoryDetailViewProps {
  stats: CategoryDetailStats;
  chartData: ChartDataPoint[];
  habitContributions: { byXp: HabitContribution[]; byCompletions: HabitContribution[] };
  levelEvents: CategoryLevelEvent[];
  transactions: XpTransaction[];
}

export function CategoryDetailView({
  stats,
  chartData,
  habitContributions,
  levelEvents,
  transactions,
}: CategoryDetailViewProps) {
  const { category, levelProgress, totalCategoryXp } = stats;
  const accent = category.accent_color ?? "#58C7FF";

  return (
    <div className="space-y-8">
      <Link
        href="/progress"
        className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Progress
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-4 mb-6">
          <TierBadge
            tier={levelProgress.tier}
            iconId={category.icon}
            accentColor={accent}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
            <p className="text-foreground-secondary mt-1">
              Level {levelProgress.level} · {levelProgress.tier}
            </p>
            <p className="text-xs text-muted mt-2">
              {totalCategoryXp.toLocaleString()} permanent XP
            </p>
          </div>
        </div>

        {levelProgress.isMaxLevel ? (
          <div className="space-y-2">
            <p className="text-sm text-foreground-secondary">Level 10 · Master</p>
            <p className="text-xs text-muted">Maximum level reached</p>
            <ProgressBar value={100} color={accent} />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-foreground-secondary">
              {levelProgress.xpInLevel} / {levelProgress.xpRequiredInLevel} XP
            </p>
            <ProgressBar
              value={levelProgress.xpInLevel}
              max={levelProgress.xpRequiredInLevel}
              color={accent}
            />
            <p className="text-xs text-muted">
              {levelProgress.xpRemaining} XP until Level {levelProgress.level + 1}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="XP this week" value={`+${stats.weekXp}`} variant="positive" />
        <StatCard label="XP this month" value={`+${stats.monthXp}`} variant="positive" />
        <StatCard label="Good completions" value={stats.goodCompletions} />
        <StatCard label="Active habits" value={stats.activeHabitCount} />
      </div>

      {stats.badOccurrences > 0 && (
        <p className="text-sm text-foreground-secondary">
          Bad habit occurrences:{" "}
          <span className="text-negative">{stats.badOccurrences}</span>
          <span className="text-muted"> · does not affect permanent category XP</span>
        </p>
      )}

      <XpGrowthChart data={chartData} categories={[category]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <HabitContributionSection
          byXp={habitContributions.byXp}
          byCompletions={habitContributions.byCompletions}
        />
        <LevelUpTimeline
          events={levelEvents}
          title="Level-up timeline"
          emptyMessage="No level-ups recorded for this category yet."
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent category activity
        </h2>
        <TransactionList
          transactions={transactions}
          emptyMessage="No habit activity for this category yet."
        />
      </div>

      {!levelProgress.isMaxLevel && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Next milestone
          </h2>
          <p className="text-sm text-foreground-secondary mb-4">
            Reach Level {levelProgress.level + 1} with {levelProgress.xpRemaining} more permanent XP.
          </p>
          <ProgressBar
            value={levelProgress.xpInLevel}
            max={levelProgress.xpRequiredInLevel}
            color={accent}
          />
        </div>
      )}
    </div>
  );
}
