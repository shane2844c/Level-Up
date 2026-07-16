import type { XpTransaction } from "@/lib/types";

export function isHabitTransaction(tx: XpTransaction): boolean {
  return tx.transaction_type === "good_habit" || tx.transaction_type === "bad_habit";
}

export function isReversibleHabitTransaction(tx: XpTransaction): boolean {
  return isHabitTransaction(tx) && !tx.reversed_at;
}

export function isReversalTransaction(tx: XpTransaction): boolean {
  return tx.transaction_type === "habit_reversal";
}

/** Visible in default activity feeds (dashboard, history). */
export function isVisibleInActivityFeed(tx: XpTransaction): boolean {
  if (isReversalTransaction(tx)) return false;
  if (tx.reversed_at) return false;
  return true;
}

/** Shown when "Show removed activities" filter is enabled. */
export function isRemovedActivityDisplay(tx: XpTransaction): boolean {
  return isHabitTransaction(tx) && Boolean(tx.reversed_at);
}

export function getHabitActivityName(tx: XpTransaction): string {
  if (tx.habit?.name) return tx.habit.name;
  const match = tx.description.match(/^(.+?)\s*\(/);
  return match?.[1]?.trim() ?? tx.description.replace(/^Removed:\s*/, "");
}

export function filterActivityFeed(
  transactions: XpTransaction[],
  options?: { showRemoved?: boolean }
): XpTransaction[] {
  if (options?.showRemoved) {
    return transactions.filter(
      (tx) => isVisibleInActivityFeed(tx) || isRemovedActivityDisplay(tx)
    );
  }
  return transactions.filter(isVisibleInActivityFeed);
}

export function getOriginalXpAmount(tx: XpTransaction): number {
  return Math.abs(tx.bank_xp_change);
}
