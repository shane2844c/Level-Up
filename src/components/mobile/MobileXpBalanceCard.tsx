import Link from "next/link";
import { Zap } from "lucide-react";
import type { XpSummary } from "@/lib/types";

interface MobileXpBalanceCardProps {
  summary: XpSummary;
  weekEarned?: number;
  weekSpent?: number;
}

export function MobileXpBalanceCard({
  summary,
  weekEarned = 0,
  weekSpent = 0,
}: MobileXpBalanceCardProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground-secondary">
            Available XP
          </span>
        </div>
        <Link
          href="/rewards"
          className="text-sm text-primary hover:text-primary-hover transition-colors min-h-[44px] inline-flex items-center active:opacity-70"
        >
          Rewards
        </Link>
      </div>

      <p className="text-[2.25rem] leading-none font-bold text-primary text-glow mb-4">
        {summary.currentBalance.toLocaleString()} XP
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-background-secondary px-3 py-2.5">
          <p className="text-xs text-muted">Earned this week</p>
          <p className="font-semibold text-positive mt-0.5">+{weekEarned}</p>
        </div>
        <div className="rounded-xl bg-background-secondary px-3 py-2.5">
          <p className="text-xs text-muted">Spent this week</p>
          <p className="font-semibold text-foreground mt-0.5">-{weekSpent}</p>
        </div>
      </div>
    </div>
  );
}
