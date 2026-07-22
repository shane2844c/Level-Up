"use client";

import { useEffect, useRef, useState } from "react";
import { JarPhysicsEngine } from "@/components/habit-jar/glass-jar/jar-physics-engine";
import { CoinSprite } from "@/components/habit-jar/glass-jar/CoinSprite";
import type { CoinRenderState, JarPhysicsApi } from "@/components/habit-jar/glass-jar/types";
import {
  COIN_RADIUS,
  JAR_GEOMETRY,
  JAR_HEIGHT,
  JAR_WIDTH,
  MAX_PHYSICS_COINS,
} from "@/lib/jar-geometry";

interface CoinCanvasProps {
  habitId: string;
  totalCoins: number;
  reducedMotion?: boolean;
  onReady: (api: JarPhysicsApi) => void;
  onDestroy: () => void;
}

/** HTML coin layer — Matter.js simulation rendered with percentage positioning */
export function CoinCanvas({
  habitId,
  totalCoins,
  reducedMotion = false,
  onReady,
  onDestroy,
}: CoinCanvasProps) {
  const [coins, setCoins] = useState<CoinRenderState[]>([]);
  const onReadyRef = useRef(onReady);
  const onDestroyRef = useRef(onDestroy);
  const initialForHabitRef = useRef({ id: habitId, count: totalCoins });

  if (initialForHabitRef.current.id !== habitId) {
    initialForHabitRef.current = { id: habitId, count: totalCoins };
  }

  onReadyRef.current = onReady;
  onDestroyRef.current = onDestroy;

  useEffect(() => {
    const engine = new JarPhysicsEngine(initialForHabitRef.current.count, reducedMotion);
    const api: JarPhysicsApi = {
      dropCoin: () => engine.dropCoin(),
      removeLastCoin: () => engine.removeLastCoin(),
    };

    onReadyRef.current(api);

    let frame = 0;
    const tick = () => {
      setCoins(engine.getCoinStates());
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      engine.destroy();
      onDestroyRef.current();
    };
  }, [habitId, reducedMotion]);

  const clipTop = JAR_GEOMETRY.openingCenterY - JAR_GEOMETRY.openingRadiusY - 8;
  const clipLeft = JAR_GEOMETRY.bodyLeft + 6;
  const clipWidth = JAR_GEOMETRY.bodyRight - JAR_GEOMETRY.bodyLeft - 12;
  const clipHeight = JAR_GEOMETRY.bodyBottom - clipTop - 6;
  const coinSizePct = (COIN_RADIUS * 2 / clipWidth) * 100;
  const overflow = totalCoins > MAX_PHYSICS_COINS;

  return (
    <div
      className="absolute inset-0"
      style={{
        left: `${(clipLeft / JAR_WIDTH) * 100}%`,
        top: `${(clipTop / JAR_HEIGHT) * 100}%`,
        width: `${(clipWidth / JAR_WIDTH) * 100}%`,
        height: `${(clipHeight / JAR_HEIGHT) * 100}%`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="absolute will-change-transform"
            style={{
              left: `${((coin.x - COIN_RADIUS - clipLeft) / clipWidth) * 100}%`,
              top: `${((coin.y - COIN_RADIUS - clipTop) / clipHeight) * 100}%`,
              width: `${coinSizePct}%`,
              aspectRatio: "1 / 1",
              pointerEvents: "none",
            }}
          >
            <CoinSprite angle={coin.angle} seed={coin.seed} />
          </div>
        ))}

        {overflow && (
          <div
            className="pointer-events-none absolute inset-x-[8%] bottom-[6%] h-[18%] rounded-[50%] bg-gradient-to-t from-[#d4a017]/35 via-[#f5c542]/18 to-transparent"
            aria-hidden="true"
          />
        )}

        {totalCoins === 0 && coins.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center px-4 pt-6 text-center text-xs text-[var(--jar-text-muted)] md:text-sm">
            Tap Add Coin to begin
          </p>
        )}
      </div>
    </div>
  );
}
