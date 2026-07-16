import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  buildChartData,
  getCategoryDetailStats,
  getCategoryGoodHabitRows,
  getCategoryTransactions,
  getHabitContributions,
  getLevelEvents,
} from "@/lib/progress";
import { CategoryDetailView } from "@/components/progress/CategoryDetailView";

interface CategoryProgressPageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function CategoryProgressPage({
  params,
}: CategoryProgressPageProps) {
  const { categoryId } = await params;
  const supabase = await createClient();

  const stats = await getCategoryDetailStats(supabase, categoryId);
  if (!stats) notFound();

  const [goodRows, levelEvents, transactions] = await Promise.all([
    getCategoryGoodHabitRows(supabase, categoryId),
    getLevelEvents(supabase, categoryId, 10),
    getCategoryTransactions(supabase, categoryId),
  ]);

  const chartData = buildChartData(goodRows, "day");
  const habitContributions = getHabitContributions(goodRows, [stats.category]);

  return (
    <CategoryDetailView
      stats={stats}
      chartData={chartData}
      habitContributions={habitContributions}
      levelEvents={levelEvents}
      transactions={transactions}
    />
  );
}
