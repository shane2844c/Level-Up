"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActiveJarView } from "@/components/habit-jar/ActiveJarView";
import { JarNavigation } from "@/components/habit-jar/JarNavigation";
import { JarHeader } from "@/components/habit-jar/JarHeader";
import { MobileJarFooter } from "@/components/habit-jar/MobileJarFooter";
import type { JarPhysicsApi } from "@/components/habit-jar/glass-jar/types";
import { useMobileJarDimensions } from "@/hooks/useMobileJarDimensions";
import type { Habit } from "@/lib/types";
import type { HabitJarStats } from "@/lib/jar-stats";
import { cn } from "@/lib/utils";

interface HabitJarCarouselProps {
  habits: Habit[];
  getStats: (habitId: string) => HabitJarStats;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  processingId: string | null;
  glowingId: string | null;
  reducedMotion: boolean;
  onAddCoin: (habit: Habit) => void;
  onOpenMenu: (habit: Habit) => void;
  onRegisterPhysics: (habitId: string, api: JarPhysicsApi | null) => void;
  setButtonRef: (habitId: string) => (node: HTMLButtonElement | null) => void;
}

export function HabitJarCarousel({
  habits,
  getStats,
  activeIndex,
  onIndexChange,
  processingId,
  glowingId,
  reducedMotion,
  onAddCoin,
  onOpenMenu,
  onRegisterPhysics,
  setButtonRef,
}: HabitJarCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const programmaticScroll = useRef(false);
  const dims = useMobileJarDimensions();
  const swipeLocked = processingId !== null;

  const goTo = useCallback(
    (index: number) => {
      onIndexChange(Math.max(0, Math.min(habits.length - 1, index)));
    },
    [habits.length, onIndexChange]
  );

  const goPrevious = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      const el = scrollRef.current;
      if (!el) return;

      programmaticScroll.current = true;
      el.scrollTo({
        left: index * el.clientWidth,
        behavior: smooth && !reducedMotion ? "smooth" : "auto",
      });

      window.setTimeout(() => {
        programmaticScroll.current = false;
      }, smooth && !reducedMotion ? 350 : 50);
    },
    [reducedMotion]
  );

  const updateIndexFromScroll = useCallback(() => {
    if (programmaticScroll.current || swipeLocked) return;

    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;

    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeIndex && index >= 0 && index < habits.length) {
      onIndexChange(index);
    }
  }, [activeIndex, habits.length, onIndexChange, swipeLocked]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const currentScrollIndex = Math.round(el.scrollLeft / el.clientWidth);
    if (currentScrollIndex !== activeIndex) {
      scrollToIndex(activeIndex);
    }
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => scrollToIndex(activeIndex, false));
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateIndexFromScroll, 80);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", updateIndexFromScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", updateIndexFromScroll);
      clearTimeout(scrollTimeout);
    };
  }, [updateIndexFromScroll]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrevious]);

  const activeHabit = habits[activeIndex];
  const activeStats = activeHabit ? getStats(activeHabit.id) : null;
  const jarNames = habits.map((habit) => habit.name);

  return (
    <section
      className="relative flex flex-col"
      aria-roledescription="carousel"
      aria-label="Your habit jars"
    >
      {activeHabit && (
        <div className="md:hidden">
          <JarHeader
            habit={activeHabit}
            onOpenMenu={() => onOpenMenu(activeHabit)}
            compact
          />
        </div>
      )}

      {habits.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            disabled={activeIndex === 0}
            className="absolute left-0 top-[42%] z-10 hidden md:flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[var(--jar-text-secondary)] shadow-lg backdrop-blur-sm transition-all hover:scale-105 disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Previous jar"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={activeIndex >= habits.length - 1}
            className="absolute right-0 top-[42%] z-10 hidden md:flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[var(--jar-text-secondary)] shadow-lg backdrop-blur-sm transition-all hover:scale-105 disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Next jar"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "jar-carousel-scroll scrollbar-none w-full",
          swipeLocked && "jar-carousel-locked"
        )}
        aria-busy={swipeLocked}
      >
        {habits.map((habit, index) => (
          <div
            key={habit.id}
            className="jar-carousel-slide"
            role="tabpanel"
            aria-hidden={index !== activeIndex}
            aria-label={habit.name}
          >
            {Math.abs(index - activeIndex) <= 1 ? (
              <ActiveJarView
                habit={habit}
                stats={getStats(habit.id)}
                isActive={index === activeIndex}
                adding={processingId === habit.id}
                glowing={glowingId === habit.id}
                reducedMotion={reducedMotion}
                onAddCoin={() => onAddCoin(habit)}
                onOpenMenu={() => onOpenMenu(habit)}
                onRegisterPhysics={onRegisterPhysics}
                addButtonRef={setButtonRef(habit.id)}
                displayWidth={dims.jarWidth}
                displayHeight={dims.jarHeight}
              />
            ) : (
              <div
                className="mx-auto"
                style={{ width: dims.jarWidth, height: dims.jarHeight }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {activeHabit && activeStats && (
        <div className="md:hidden">
          <MobileJarFooter
            habit={activeHabit}
            stats={activeStats}
            jarCount={habits.length}
            activeIndex={activeIndex}
            adding={processingId === activeHabit.id}
            jarNames={jarNames}
            onAddCoin={() => onAddCoin(activeHabit)}
            onPrevious={goPrevious}
            onNext={goNext}
            onSelect={goTo}
            addButtonRef={setButtonRef(activeHabit.id)}
          />
        </div>
      )}

      <div className="hidden md:block">
        <JarNavigation
          count={habits.length}
          activeIndex={activeIndex}
          onPrevious={goPrevious}
          onNext={goNext}
          onSelect={goTo}
          jarNames={jarNames}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        Viewing jar {activeIndex + 1} of {habits.length}: {activeHabit?.name}
      </p>
    </section>
  );
}
