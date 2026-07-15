import { createClient } from "@/lib/supabase/server";
import { getRewards, getXpSummary } from "@/lib/data";
import { RewardsClient } from "@/components/rewards/RewardsClient";

export default async function RewardsPage() {
  const supabase = await createClient();

  const [rewards, xpSummary] = await Promise.all([
    getRewards(supabase, false),
    getXpSummary(supabase),
  ]);

  return (
    <RewardsClient
      rewards={rewards}
      currentBalance={xpSummary.currentBalance}
    />
  );
}
