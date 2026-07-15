"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn, formatXp } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { logHabit } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import type { Habit } from "@/lib/types";

interface HabitCardProps {
  habit: Habit;
  onLogged?: () => void;
  compact?: boolean;
}

export function HabitCard({ habit, onLogged, compact = false }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const isGood = habit.habit_type === "good";

  const handleLog = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const result = await logHabit(supabase, habit.id);
      const change = result.transaction.bank_xp_change;
      showToast(
        `${habit.name}: ${formatXp(change)}`,
        "success"
      );
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
        onClick={handleLog}
        disabled={loading}
        className={cn(
          "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          isGood
            ? "bg-positive/15 text-positive hover:bg-positive/25"
            : "bg-negative/15 text-negative hover:bg-negative/25"
        )}
      >
        {loading
          ? "..."
          : isGood
            ? `Complete +${habit.xp_amount} XP`
            : `Log occurrence -${habit.xp_amount} XP`}
      </button>
    </div>
  );
}
