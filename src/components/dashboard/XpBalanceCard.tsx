import { TrendingUp, TrendingDown, Gift, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { getNegativeBalanceMessage } from "@/lib/remove-activity";
import type { XpSummary } from "@/lib/types";

interface XpBalanceCardProps {
  summary: XpSummary;
}

export function XpBalanceCard({ summary }: XpBalanceCardProps) {
  const negativeMessage = getNegativeBalanceMessage(summary.currentBalance);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-sm text-foreground-secondary uppercase tracking-wide">
          XP Bank
        </span>
      </div>
      <p className="text-5xl font-bold text-primary text-glow mb-2">
        {summary.currentBalance.toLocaleString()}
      </p>
      {negativeMessage && (
        <p className="text-sm text-negative mb-4 leading-relaxed">{negativeMessage}</p>
      )}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard
          label="Earned"
          value={`+${summary.totalEarned}`}
          icon={TrendingUp}
          variant="positive"
        />
        <StatCard
          label="Lost"
          value={`-${summary.totalLost}`}
          icon={TrendingDown}
          variant="negative"
        />
        <StatCard
          label="Spent"
          value={`-${summary.totalSpent}`}
          icon={Gift}
        />
      </div>
    </div>
  );
}
