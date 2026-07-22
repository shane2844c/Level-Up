"use client";

import { HabitJarCard } from "@/components/habit-jar/HabitJarCard";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";

interface HabitJarGridProps {
  habits: Habit[];
  getStats: (habitId: string) => HabitJarStats;
  onAddCoin: (habit: Habit) => void;
  onOpenMenu: (habit: Habit) => void;
  onOpenDetails: (habit: Habit) => void;
  processingId: string | null;
  glowingId: string | null;
  newJarId?: string | null;
  setJarRef: (habitId: string) => (node: HTMLButtonElement | null) => void;
  setButtonRef: (habitId: string) => (node: HTMLButtonElement | null) => void;
}

export function HabitJarGrid({
  habits,
  getStats,
  onAddCoin,
  onOpenMenu,
  onOpenDetails,
  processingId,
  glowingId,
  newJarId,
  setJarRef,
  setButtonRef,
}: HabitJarGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
      {habits.map((habit) => (
        <HabitJarCard
          key={habit.id}
          habit={habit}
          stats={getStats(habit.id)}
          onAddCoin={() => onAddCoin(habit)}
          onOpenMenu={() => onOpenMenu(habit)}
          onOpenDetails={() => onOpenDetails(habit)}
          adding={processingId === habit.id}
          glowing={glowingId === habit.id}
          isNew={newJarId === habit.id}
          jarRef={setJarRef(habit.id)}
          addButtonRef={setButtonRef(habit.id)}
        />
      ))}
    </div>
  );
}
