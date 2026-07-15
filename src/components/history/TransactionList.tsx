import {
  TrendingUp,
  TrendingDown,
  Gift,
  Settings2,
} from "lucide-react";
import { cn, formatDateTime, formatXp } from "@/lib/utils";
import type { XpTransaction } from "@/lib/types";

interface TransactionListProps {
  transactions: XpTransaction[];
  emptyMessage?: string;
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

export function TransactionList({
  transactions,
  emptyMessage = "Your XP history will appear here after you log your first habit.",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-8">{emptyMessage}</p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((tx) => {
        const Icon = getTransactionIcon(tx.transaction_type);
        const isPositive = tx.bank_xp_change > 0;

        return (
          <li
            key={tx.id}
            className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                isPositive ? "bg-positive/15" : "bg-negative/15"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isPositive ? "text-positive" : "text-negative"
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tx.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span>{getTransactionLabel(tx.transaction_type)}</span>
                {tx.category && (
                  <>
                    <span>·</span>
                    <span>{tx.category.name}</span>
                  </>
                )}
                <span>·</span>
                <span>{formatDateTime(tx.created_at)}</span>
              </div>
            </div>

            <span
              className={cn(
                "text-sm font-semibold shrink-0",
                isPositive ? "text-positive" : "text-negative"
              )}
            >
              {formatXp(tx.bank_xp_change)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
