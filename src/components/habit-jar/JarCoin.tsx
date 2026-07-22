"use client";

import { CoinSpriteDecor } from "@/components/habit-jar/glass-jar/CoinSprite";

export { CoinSprite, CoinSpriteDecor } from "@/components/habit-jar/glass-jar/CoinSprite";

/** Decorative coin for empty states / headers */
export function JarCoin({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return <CoinSpriteDecor size={size} className={className} />;
}
