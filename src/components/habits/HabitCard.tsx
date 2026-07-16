"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn, formatXp } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { logHabit } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { useLevelUpCelebration } from "@/components/progress/LevelUpCelebration";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getCrossedLevels } from "@/lib/levels";
import type { Habit } from "@/lib/types";

interface HabitCardProps {
  habit: Habit;
  onLogged?: () => void;
  compact?: boolean;
  mobile?: boolean;
}

export function HabitCard({
  habit,
  onLogged,
  compact = false,
  mobile = false,
}: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { celebrateLevelUps } = useLevelUpCelebration();
  const online = useOnlineStatus();
  const isGood = habit.habit_type === "good";

  const handleLog = async () => {
    if (loading) return;
    if (!online) {
      showToast("You're offline. Connect to the internet to log habits.", "error");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const result = await logHabit(supabase, habit.id);
      const change = result.transaction.bank_xp_change;
      showToast(`${habit.name}: ${formatXp(change)}`, "success");

      if (isGood && result.level_ups && result.level_ups.length > 0) {
        celebrateLevelUps(
          habit.category?.name ?? "Category",
          result.level_ups
        );
      } else if (isGood && result.transaction.category_xp_change > 0) {
        const xpBefore = result.category_xp_before ?? 0;
        const xpAfter = xpBefore + result.transaction.category_xp_change;
        const crossed = getCrossedLevels(xpBefore, xpAfter);
        if (crossed.length > 0) {
          celebrateLevelUps(habit.category?.name ?? "Category", crossed);
        }
      }

      onLogged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to log habit";
      showToast(
        message.includes("inactive") || message.includes("not found")
          ? "This habit is no longer available."
          : "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const actionLabel = loading
    ? "Saving..."
    : isGood
      ? `Complete +${habit.xp_amount} XP`
      : `Log -${habit.xp_amount} XP`;

  if (mobile) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              isGood ? "bg-positive/15" : "bg-negative/15"
            )}
          >
            {isGood ? (
              <CheckCircle2 className="h-4 w-4 text-positive" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-negative" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-foreground">{habit.name}</p>
            <p className="text-sm text-foreground-secondary mt-0.5">
              {habit.category?.name ?? "Uncategorised"} ·{" "}
              <span className={isGood ? "text-positive" : "text-negative"}>
                {isGood ? "Good" : "Bad"} · {habit.xp_amount} XP
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLog}
          disabled={loading}
          className={cn(
            "mt-4 w-full min-h-[48px] rounded-xl text-sm font-medium transition-colors active:opacity-80",
            isGood
              ? "bg-positive/15 text-positive hover:bg-positive/25"
              : "bg-negative/15 text-negative hover:bg-negative/25"
          )}
        >
          {actionLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex items-center gap-4",
        compact && "p-3"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
          isGood ? "bg-positive/15" : "bg-negative/15"
        )}
      >
        {isGood ? (
          <CheckCircle2 className="h-4 w-4 text-positive" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-negative" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{habit.name}</p>
        {!compact && habit.category && (
          <p className="text-xs text-muted truncate">{habit.category.name}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleLog}
        disabled={loading}
        className={cn(
          "shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] active:opacity-80",
          isGood
            ? "bg-positive/15 text-positive hover:bg-positive/25"
            : "bg-negative/15 text-negative hover:bg-negative/25"
        )}
      >
        {actionLabel}
      </button>
    </div>
  );
}
