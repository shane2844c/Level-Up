"use client";

import { useCallback, useEffect, useRef } from "react";
import { GlassJarScene } from "@/components/habit-jar/glass-jar/GlassJarScene";
import { JarHeader } from "@/components/habit-jar/JarHeader";
import { JarStats } from "@/components/habit-jar/JarStats";
import { AddCoinButton } from "@/components/habit-jar/AddCoinButton";
import type { JarPhysicsApi } from "@/components/habit-jar/glass-jar/types";
import { getJarAccentColor } from "@/lib/jar-stats";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";

interface ActiveJarViewProps {
  habit: Habit;
  stats: HabitJarStats;
  isActive: boolean;
  adding: boolean;
  glowing: boolean;
  reducedMotion: boolean;
  displayWidth: number;
  displayHeight: number;
  onAddCoin: () => void;
  onOpenMenu: () => void;
  onRegisterPhysics: (habitId: string, api: JarPhysicsApi | null) => void;
  addButtonRef?: React.Ref<HTMLButtonElement>;
}

export function ActiveJarView({
  habit,
  stats,
  isActive,
  adding,
  glowing,
  reducedMotion,
  displayWidth,
  displayHeight,
  onAddCoin,
  onOpenMenu,
  onRegisterPhysics,
  addButtonRef,
}: ActiveJarViewProps) {
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    return () => {
      onRegisterPhysics(habit.id, null);
    };
  }, [habit.id, onRegisterPhysics]);

  const handlePhysicsReady = useCallback(
    (api: JarPhysicsApi) => {
      if (isActiveRef.current) {
        onRegisterPhysics(habit.id, api);
      }
    },
    [habit.id, onRegisterPhysics]
  );

  const handlePhysicsDestroy = useCallback(() => {
    if (isActiveRef.current) {
      onRegisterPhysics(habit.id, null);
    }
  }, [habit.id, onRegisterPhysics]);

  useEffect(() => {
    if (!isActive) {
      onRegisterPhysics(habit.id, null);
    }
  }, [isActive, habit.id, onRegisterPhysics]);

  const accent = getJarAccentColor(habit);

  return (
    <div className="flex flex-col items-center px-1 pb-2 md:px-2 md:pb-8">
      <div className="hidden md:block w-full">
        <JarHeader habit={habit} onOpenMenu={onOpenMenu} />
      </div>

      <div
        className="flex w-full items-center justify-center"
        style={{ minHeight: displayHeight }}
      >
        {isActive ? (
          <GlassJarScene
            habitId={habit.id}
            totalCoins={stats.totalCoins}
            accentColor={accent}
            glowing={glowing}
            reducedMotion={reducedMotion}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            onPhysicsReady={handlePhysicsReady}
            onPhysicsDestroy={handlePhysicsDestroy}
          />
        ) : (
          <div
            className="rounded-[2rem] bg-white/25 animate-pulse"
            style={{ width: displayWidth, height: displayHeight }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="hidden md:block mt-6 w-full max-w-lg">
        <JarStats stats={stats} accentColor={accent} />
      </div>

      <div className="hidden md:block mt-8 w-full max-w-sm">
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
