"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logHabit } from "@/lib/data";
import { buildHabitJarStats } from "@/lib/jar-stats";
import { useToast } from "@/components/ui/Toast";
import type { HabitCompletionRow } from "@/lib/jar-stats";
import type { Habit } from "@/lib/types";

const SUCCESS_MESSAGES = [
  "Another vote for your future self.",
  "One more coin added.",
  "You showed up today.",
  "Your identity is built one action at a time.",
];

interface AddCoinOptions {
  onDrop?: (habitId: string) => void;
  onRollback?: (habitId: string) => void;
}

export function useAddCoin(completions: HabitCompletionRow[]) {
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [glowingId, setGlowingId] = useState<string | null>(null);
  const [localCompletions, setLocalCompletions] = useState(completions);
  const optionsRef = useRef<AddCoinOptions>({});

  const syncCompletions = useCallback((rows: HabitCompletionRow[]) => {
    setLocalCompletions(rows);
  }, []);

  const getStats = useCallback(
    (habitId: string) => buildHabitJarStats(habitId, localCompletions),
    [localCompletions]
  );

  const setCoinHandlers = useCallback((options: AddCoinOptions) => {
    optionsRef.current = options;
  }, []);

  const addCoin = useCallback(
    async (habit: Habit) => {
      if (processingId) return;
      setProcessingId(habit.id);

      const previous = localCompletions;
      const optimisticId = `optimistic-${crypto.randomUUID()}`;
      const optimisticRow: HabitCompletionRow = {
        id: optimisticId,
        habit_id: habit.id,
        created_at: new Date().toISOString(),
      };

      setLocalCompletions((rows) => [optimisticRow, ...rows]);
      optionsRef.current.onDrop?.(habit.id);

      try {
        const supabase = createClient();
        const result = await logHabit(supabase, habit.id);

        setLocalCompletions((rows) => {
          const withoutOptimistic = rows.filter((row) => row.id !== optimisticId);
          return [
            {
              id: result.transaction.id,
              habit_id: habit.id,
              created_at: result.transaction.created_at,
            },
            ...withoutOptimistic,
          ];
        });

        setGlowingId(habit.id);
        setTimeout(() => setGlowingId(null), 650);
        showToast(
          SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)],
          "success"
        );
      } catch {
        setLocalCompletions(previous);
        optionsRef.current.onRollback?.(habit.id);
        showToast("The coin could not be saved.", "error");
      } finally {
        setProcessingId(null);
      }
    },
    [localCompletions, processingId, showToast]
  );

  return {
    addCoin,
    processingId,
    glowingId,
    getStats,
    localCompletions,
    syncCompletions,
    setCoinHandlers,
  };
}

export function useJarRefs() {
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setButtonRef = (habitId: string) => (node: HTMLButtonElement | null) => {
    if (node) buttonRefs.current.set(habitId, node);
    else buttonRefs.current.delete(habitId);
  };

  return { buttonRefs, setButtonRef };
}
