"use client";

import { useMemo } from "react";
import { JarCoin } from "@/components/habit-jar/JarCoin";
import { getJarFillPercent, getVisibleCoinSlots } from "@/lib/jar-stats";

interface JarCoinsDisplayProps {
  totalCoins: number;
  targetCompletions?: number | null;
  accentColor?: string;
  compact?: boolean;
}

function getCoinPosition(index: number, totalVisible: number, compact: boolean) {
  const cols = compact ? 4 : 5;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const rowCount = Math.ceil(totalVisible / cols);
  const leftBase = 12 + col * (compact ? 18 : 16);
  const bottomBase = 8 + row * (compact ? 14 : 16);
  const jitter = ((index * 7) % 5) - 2;
  return {
    left: `${leftBase + jitter}%`,
    bottom: `${bottomBase + ((rowCount - 1 - row) * (compact ? 12 : 14))}%`,
    zIndex: row + 1,
  };
}

export function JarCoinsDisplay({
  totalCoins,
  targetCompletions,
  accentColor = "#58C7FF",
  compact = false,
}: JarCoinsDisplayProps) {
  const visibleCount = getVisibleCoinSlots(totalCoins);
  const fillPercent = getJarFillPercent(totalCoins, targetCompletions);

  const positions = useMemo(
    () =>
      Array.from({ length: visibleCount }, (_, index) =>
        getCoinPosition(index, visibleCount, compact)
      ),
    [visibleCount, compact]
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-[1.4rem] transition-all duration-500 ease-out"
        style={{
          height: `${Math.max(fillPercent, totalCoins > 0 ? 12 : 0)}%`,
          background: `linear-gradient(180deg, ${accentColor}12 0%, ${accentColor}28 100%)`,
        }}
      />

      {totalCoins > visibleCount && (
        <div className="absolute inset-x-3 bottom-2 top-1/3 rounded-xl bg-gradient-to-t from-[#f5c542]/25 to-transparent pointer-events-none" />
      )}

      {positions.map((pos, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: pos.left,
            bottom: pos.bottom,
            zIndex: pos.zIndex,
          }}
        >
          <JarCoin size={compact ? "sm" : "md"} />
        </div>
      ))}

      {totalCoins === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-xs text-[var(--jar-text-muted)] px-4 text-center">
          Add your first coin
        </p>
      )}
    </div>
  );
}
