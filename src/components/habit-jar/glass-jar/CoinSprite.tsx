"use client";

import { useId } from "react";
import { coinPerspectiveScale } from "@/lib/jar-geometry";
import { cn } from "@/lib/utils";

const COIN_DIAMETER = 24;

interface CoinSpriteProps {
  angle?: number;
  seed?: number;
  className?: string;
}

/** Fixed-size metallic coin — always 24px logical diameter */
export function CoinSprite({ angle = 0, seed = 0, className }: CoinSpriteProps) {
  const uid = useId().replace(/:/g, "");
  const perspective = coinPerspectiveScale(angle);
  const emblem = seed % 3;
  const gradId = `cg-${uid}`;
  const rimId = `cr-${uid}`;
  const shineId = `cs-${uid}`;

  return (
    <div
      className={cn("h-full w-full", className)}
      style={{
        filter: "drop-shadow(0 2px 3px rgba(60, 40, 0, 0.38))",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-full w-full"
        style={{
          transform: `rotate(${angle}rad)`,
          transformOrigin: "center center",
        }}
      >
        <defs>
          <radialGradient id={gradId} cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#fff4c2" />
            <stop offset="35%" stopColor="#f5d056" />
            <stop offset="72%" stopColor="#d4a017" />
            <stop offset="100%" stopColor="#8a6410" />
          </radialGradient>
          <linearGradient id={rimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9941a" />
            <stop offset="50%" stopColor="#f0c84a" />
            <stop offset="100%" stopColor="#7a5a0e" />
          </linearGradient>
          <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse
          cx="16"
          cy="16"
          rx={15 * perspective}
          ry="15"
          fill="#6b4e0c"
          opacity={1 - perspective * 0.35}
        />
        <ellipse cx="16" cy="16" rx={14.5 * perspective} ry="14.5" fill={`url(#${gradId})`} />
        <ellipse
          cx="16"
          cy="16"
          rx={14.5 * perspective}
          ry="14.5"
          fill="none"
          stroke={`url(#${rimId})`}
          strokeWidth="1.4"
        />
        <ellipse
          cx="16"
          cy="16"
          rx={10.5 * perspective}
          ry="10.5"
          fill="none"
          stroke="#b88912"
          strokeWidth="0.9"
          opacity="0.75"
        />
        {emblem === 0 && (
          <path d="M16 11.5 L17.6 15.2 L16 18.8 L14.4 15.2 Z" fill="#c9a020" opacity="0.85" />
        )}
        {emblem === 1 && (
          <path
            d="M12.5 16.5 L15 19.5 L21 12.5"
            fill="none"
            stroke="#c9a020"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}
        {emblem === 2 && <circle cx="16" cy="16" r="2.2" fill="#c9a020" opacity="0.8" />}
        <ellipse cx="11" cy="10" rx={5 * perspective} ry="3.5" fill={`url(#${shineId})`} />
        <ellipse cx="20" cy="21" rx={6 * perspective} ry="5" fill="#5a4208" opacity="0.22" />
      </svg>
    </div>
  );
}

export function CoinSpriteDecor({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "sm" ? 18 : size === "lg" ? 34 : COIN_DIAMETER;
  return (
    <div className={className} style={{ width: px, height: px }}>
      <CoinSprite seed={size === "lg" ? 7 : 4} angle={0.35} />
    </div>
  );
}
