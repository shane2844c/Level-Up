"use client";

import { JarStats } from "@/components/habit-jar/JarStats";
import { JarNavigation } from "@/components/habit-jar/JarNavigation";
import { AddCoinButton } from "@/components/habit-jar/AddCoinButton";
import { getJarAccentColor } from "@/lib/jar-stats";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";

interface MobileJarFooterProps {
  habit: Habit;
  stats: HabitJarStats;
  jarCount: number;
  activeIndex: number;
  adding: boolean;
  jarNames: string[];
  onAddCoin: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  addButtonRef?: React.Ref<HTMLButtonElement>;
}

export function MobileJarFooter({
  habit,
  stats,
  jarCount,
  activeIndex,
  adding,
  jarNames,
  onAddCoin,
  onPrevious,
  onNext,
  onSelect,
  addButtonRef,
}: MobileJarFooterProps) {
  const accent = getJarAccentColor(habit);

  return (
    <div className="mt-3 flex flex-col gap-4 pb-2 md:mt-6 md:gap-6">
      <JarStats stats={stats} accentColor={accent} compact />

      <JarNavigation
        count={jarCount}
        activeIndex={activeIndex}
        onPrevious={onPrevious}
        onNext={onNext}
        onSelect={onSelect}
        jarNames={jarNames}
        compact
      />

      <div className="mx-auto w-full max-w-md px-1 pb-safe-thumb">
        <AddCoinButton
          ref={addButtonRef}
          habitName={habit.name}
          onClick={onAddCoin}
          loading={adding}
          accentColor={accent}
          completedToday={stats.coinsToday > 0}
        />
      </div>
    </div>
  );
}
