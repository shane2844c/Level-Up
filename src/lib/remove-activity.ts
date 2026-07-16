import type { XpTransaction } from "@/lib/types";
import { getHabitActivityName, getOriginalXpAmount } from "@/lib/transactions";

export function getNegativeBalanceMessage(balance: number): string | null {
  if (balance >= 0) return null;
  const amount = Math.abs(balance);
  return `Your balance is below zero because previously earned XP was removed. Earn ${amount} XP before redeeming another reward.`;
}

export function getRemoveActivityConfirmContent(tx: XpTransaction) {
  const name = getHabitActivityName(tx);
  const bankXp = getOriginalXpAmount(tx);
  const isGood = tx.transaction_type === "good_habit";
  const categoryName = tx.category?.name ?? "Category";

  const title = `Remove "${name}"?`;
  const description = "This action corrects an accidental log.";

  const details = isGood
    ? [
        { label: "Spendable XP", value: `-${bankXp} XP` },
        ...(tx.category_xp_change !== 0
          ? [{ label: `${categoryName} XP`, value: `-${Math.abs(tx.category_xp_change)} XP` }]
          : []),
      ]
    : [{ label: "Spendable XP refund", value: `+${bankXp} XP` }];

  return { title, description, details };
}

export function isAlreadyRemovedError(message: string): boolean {
  return message.toLowerCase().includes("already been removed");
}
