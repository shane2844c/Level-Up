"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { JarBackSvg } from "@/components/habit-jar/glass-jar/JarBackSvg";
import { JarFrontSvg } from "@/components/habit-jar/glass-jar/JarFrontSvg";
import type { JarPhysicsApi } from "@/components/habit-jar/glass-jar/types";
import { JAR_GEOMETRY } from "@/lib/jar-geometry";

const CoinCanvas = dynamic(
  () =>
    import("@/components/habit-jar/glass-jar/CoinCanvas").then((m) => m.CoinCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse bg-white/10" aria-hidden="true" />
    ),
  }
);

interface GlassJarSceneProps {
  habitId: string;
  totalCoins: number;
  accentColor: string;
  glowing?: boolean;
  reducedMotion?: boolean;
  displayWidth: number;
  displayHeight: number;
  onPhysicsReady: (api: JarPhysicsApi) => void;
  onPhysicsDestroy: () => void;
  className?: string;
}

/**
 * Three-layer jar: back SVG → HTML coin canvas → front SVG.
 * No foreignObject — coins render reliably on mobile WebKit.
 */
export function GlassJarScene({
  habitId,
  totalCoins,
  accentColor,
  glowing = false,
  reducedMotion = false,
  displayWidth,
  displayHeight,
  onPhysicsReady,
  onPhysicsDestroy,
  className,
}: GlassJarSceneProps) {
  return (
    <div
      className={cn("relative mx-auto select-none", glowing && "animate-jar-glow", className)}
      style={{
        width: displayWidth,
        height: displayHeight,
        maxWidth: displayWidth,
        aspectRatio: `${JAR_GEOMETRY.width} / ${JAR_GEOMETRY.height}`,
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-4 -z-10 rounded-[4rem] opacity-50 blur-3xl transition-opacity",
          glowing && "opacity-80"
        )}
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 70%, ${accentColor}40 0%, transparent 72%)`,
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0">
        <JarBackSvg accentColor={accentColor} glowing={glowing} />
      </div>

      {totalCoins > 50 && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 55% 30% at 50% 78%, rgba(245,197,66,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 z-[2]">
        <CoinCanvas
          habitId={habitId}
          totalCoins={totalCoins}
          reducedMotion={reducedMotion}
          onReady={onPhysicsReady}
          onDestroy={onPhysicsDestroy}
        />
      </div>

      <div className="absolute inset-0 z-[3]">
        <JarFrontSvg />
      </div>
    </div>
  );
}
