import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Gift,
  Settings2,
} from "lucide-react";
import { cn, formatRelativeTime, formatXp, getTransactionGroupLabel } from "@/lib/utils";
import {
  getHabitActivityName,
  isRemovedActivityDisplay,
  isReversibleHabitTransaction,
} from "@/lib/transactions";
import { TransactionRowMenu } from "@/components/history/TransactionRowMenu";
import type { XpTransaction } from "@/lib/types";

interface MobileTransactionFeedProps {
  transactions: XpTransaction[];
  emptyMessage?: string;
  compact?: boolean;
  onRemove?: (tx: XpTransaction) => void;
  removingId?: string | null;
}

function getTransactionIcon(type: XpTransaction["transaction_type"]) {
  switch (type) {
    case "good_habit":
      return TrendingUp;
    case "bad_habit":
      return TrendingDown;
    case "reward_redemption":
      return Gift;
    default:
      return Settings2;
  }
}

function getTransactionLabel(type: XpTransaction["transaction_type"]) {
  switch (type) {
    case "good_habit":
      return "Good habit";
    case "bad_habit":
      return "Bad habit";
    case "reward_redemption":
      return "Reward";
    case "manual_adjustment":
      return "Adjustment";
  }
}

export function MobileTransactionFeed({
  transactions,
  emptyMessage = "Your XP history will appear here after you log your first habit.",
  compact = false,
  onRemove,
  removingId,
}: MobileTransactionFeedProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-8">{emptyMessage}</p>
    );
  }

  const groups = new Map<string, XpTransaction[]>();
  for (const tx of transactions) {
    const label = getTransactionGroupLabel(tx.created_at);
    const existing = groups.get(label) ?? [];
    existing.push(tx);
    groups.set(label, existing);
  }

  return (
    <div className="space-y-5">
      {Array.from(groups.entries()).map(([label, items]) => (
        <section key={label}>
          {!compact && (
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 px-1">
              {label}
            </h3>
          )}
          <ul className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {items.map((tx) => {
              const removed = isRemovedActivityDisplay(tx);
              const Icon = getTransactionIcon(tx.transaction_type);
              const isPositive = tx.bank_xp_change > 0;
              const canRemove = Boolean(onRemove) && isReversibleHabitTransaction(tx);

              return (
                <li
                  key={tx.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5",
                    removed && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                      removed
                        ? "bg-muted/20"
                        : isPositive
                          ? "bg-positive/15"
                          : "bg-negative/15"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        removed
                          ? "text-muted"
                          : isPositive
                            ? "text-positive"
                            : "text-negative"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-foreground truncate">
                      {removed ? getHabitActivityName(tx) : tx.description}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {removed ? (
                        <>
                          Removed activity · Originally {formatXp(tx.bank_xp_change)}
                        </>
                      ) : (
                        <>
                          {getTransactionLabel(tx.transaction_type)}
                          {tx.category ? ` · ${tx.category.name}` : ""}
                          {compact ? ` · ${formatRelativeTime(tx.created_at)}` : ""}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canRemove && (
                      <TransactionRowMenu
                        onRemove={() => onRemove?.(tx)}
                        disabled={removingId === tx.id}
                      />
                    )}
                    {!removed && (
                      <div className="text-right">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isPositive ? "text-positive" : "text-negative"
                          )}
                        >
                          {formatXp(tx.bank_xp_change)}
                        </span>
                        {!compact && (
                          <p className="text-[11px] text-muted mt-0.5">
                            {formatRelativeTime(tx.created_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function MobileTransactionPreview({
  transactions,
  viewAllHref = "/history",
}: {
  transactions: XpTransaction[];
  viewAllHref?: string;
}) {
  return (
    <div>
      <MobileTransactionFeed transactions={transactions} compact />
      {transactions.length > 0 && (
        <Link
          href={viewAllHref}
          className="mt-4 inline-flex min-h-[44px] items-center text-sm text-primary hover:text-primary-hover transition-colors active:opacity-70"
        >
          View full history
        </Link>
      )}
    </div>
  );
}
