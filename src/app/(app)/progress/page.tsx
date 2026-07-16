import { createClient } from "@/lib/supabase/server";
import { getProgressPageData } from "@/lib/progress";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressSummaryStats } from "@/components/progress/ProgressSummaryStats";
import { CategoryProgressCard } from "@/components/dashboard/CategoryProgressCard";
import { XpGrowthChart } from "@/components/progress/XpGrowthChart";
import { CategoryXpBreakdown } from "@/components/progress/CategoryXpBreakdown";
import { HabitContributionSection } from "@/components/progress/HabitContribution";
import { LevelUpTimeline } from "@/components/progress/LevelUpTimeline";
import { UpcomingMilestones } from "@/components/progress/UpcomingMilestones";
import { MobileCollapsibleSection } from "@/components/mobile/MobileCollapsibleSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendingUp } from "lucide-react";

export default async function ProgressPage() {
  const supabase = await createClient();
  const data = await getProgressPageData(supabase);

  const hasData = data.stats.lifetimeCategoryXp > 0 || data.expandedCategories.length > 0;

  return (
    <>
      <PageHeader
        title="Progress"
        description="Permanent category XP, level progression and habit analytics."
      />

      <div className="space-y-6 md:space-y-8">
        <ProgressSummaryStats stats={data.stats} />

        <section className="hidden md:block">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Category progress
          </h2>
          {data.expandedCategories.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No category progress yet"
              description="Log good habits to start earning permanent category XP."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.expandedCategories.map((item) => (
                <CategoryProgressCard
                  key={item.category.id}
                  summary={item}
                  expanded
                  href={`/progress/${item.category.id}`}
                />
              ))}
            </div>
          )}
        </section>

        <MobileCollapsibleSection title="Category progress" defaultOpen>
          {data.expandedCategories.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No category progress yet"
              description="Log good habits to start earning permanent category XP."
            />
          ) : (
            <div className="space-y-3">
              {data.expandedCategories.map((item) => (
                <CategoryProgressCard
                  key={item.category.id}
                  summary={item}
                  expanded
                  href={`/progress/${item.category.id}`}
                />
              ))}
            </div>
          )}
        </MobileCollapsibleSection>

        {hasData && (
          <>
            <section className="hidden md:block">
              <XpGrowthChart data={data.chartData} categories={data.categories} />
            </section>
            <MobileCollapsibleSection title="XP trend" defaultOpen>
              <XpGrowthChart data={data.chartData} categories={data.categories} />
            </MobileCollapsibleSection>

            <div className="hidden md:grid gap-6 lg:grid-cols-2">
              <CategoryXpBreakdown breakdown={data.breakdown} />
              <HabitContributionSection
                byXp={data.habitContributions.byXp}
                byCompletions={data.habitContributions.byCompletions}
              />
            </div>

            <MobileCollapsibleSection title="XP breakdown">
              <CategoryXpBreakdown breakdown={data.breakdown} />
            </MobileCollapsibleSection>

            <MobileCollapsibleSection title="Top habits">
              <HabitContributionSection
                byXp={data.habitContributions.byXp}
                byCompletions={data.habitContributions.byCompletions}
              />
            </MobileCollapsibleSection>

            <MobileCollapsibleSection title="Closest milestones">
              <UpcomingMilestones milestones={data.milestones} />
            </MobileCollapsibleSection>

            <MobileCollapsibleSection title="Recent level-ups">
              <LevelUpTimeline events={data.levelEvents} />
            </MobileCollapsibleSection>

            <div className="hidden md:grid gap-6 lg:grid-cols-2">
              <LevelUpTimeline events={data.levelEvents} />
              <UpcomingMilestones milestones={data.milestones} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
