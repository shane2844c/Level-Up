"use client";

import { cn } from "@/lib/utils";
import { JarCoinsDisplay } from "@/components/habit-jar/JarCoinsDisplay";

interface VisualJarProps {
  totalCoins: number;
  targetCompletions?: number | null;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
  glowing?: boolean;
  className?: string;
  jarRef?: React.Ref<HTMLButtonElement>;
  onClick?: () => void;
  interactive?: boolean;
  ariaLabel?: string;
}

const sizeMap = {
  sm: { height: "h-32", maxW: "max-w-[120px]", rim: "h-2.5" },
  md: { height: "h-44", maxW: "max-w-[180px]", rim: "h-3" },
  lg: { height: "h-56", maxW: "max-w-[220px]", rim: "h-3.5" },
};

export function VisualJar({
  totalCoins,
  targetCompletions,
  accentColor = "#58C7FF",
  size = "md",
  glowing = false,
  className,
  jarRef,
  onClick,
  interactive = false,
  ariaLabel,
}: VisualJarProps) {
  const dims = sizeMap[size];
  const compact = size === "sm";

  const jarBody = (
    <>
      <div
        className="absolute -bottom-2 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-[100%] blur-md opacity-40"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative mx-auto w-full overflow-hidden",
          dims.maxW,
          dims.height,
          "rounded-[2rem] rounded-b-[2.75rem]",
          glowing && "animate-jar-glow"
        )}
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.08) 100%)",
          boxShadow: `
            inset 0 2px 16px rgba(255,255,255,0.85),
            inset 0 -12px 24px ${accentColor}22,
            0 8px 32px ${accentColor}20,
            0 2px 8px rgba(15,23,42,0.06)
          `,
          border: "2px solid rgba(255,255,255,0.75)",
        }}
      >
        <div
          className={cn(
            "absolute inset-x-[12%] top-0 z-20 rounded-b-full border border-white/60 bg-gradient-to-b from-white/90 to-white/30",
            dims.rim
          )}
          aria-hidden="true"
        />

        <div className="absolute inset-x-2 top-4 bottom-3 z-0 overflow-hidden rounded-[1.5rem] rounded-b-[2rem]">
          <JarCoinsDisplay
            totalCoins={totalCoins}
            targetCompletions={targetCompletions}
            accentColor={accentColor}
            compact={compact}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.45) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.15) 100%)",
          }}
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute left-3 top-8 z-10 h-[45%] w-2 rounded-full bg-white/40 blur-[1px]"
          aria-hidden="true"
        />
      </div>
    </>
  );

  if (interactive) {
    return (
      <button
        ref={jarRef}
        type="button"
        onClick={onClick}
        className={cn("relative block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-3xl", className)}
        style={{ outlineColor: accentColor }}
        aria-label={ariaLabel}
      >
        {jarBody}
      </button>
    );
  }

  return <div className={cn("relative w-full", className)}>{jarBody}</div>;
}
