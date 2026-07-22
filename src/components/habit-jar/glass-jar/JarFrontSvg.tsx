"use client";

import { useId } from "react";
import {
  JAR_BASE_PATH,
  JAR_BODY_HIGHLIGHT_PATH,
  JAR_FRONT_RIM_PATH,
  JAR_GEOMETRY,
  JAR_HEIGHT,
  JAR_LEFT_INNER_SHADOW_PATH,
  JAR_OUTLINE_PATH,
  JAR_RIGHT_INNER_SHADOW_PATH,
  JAR_THREAD_BAND_PATH,
  JAR_WIDTH,
} from "@/lib/jar-geometry";
import { cn } from "@/lib/utils";

interface JarFrontSvgProps {
  className?: string;
}

/** Front glass layer — front rim arc, thread, reflections (coins sit beneath) */
export function JarFrontSvg({ className }: JarFrontSvgProps) {
  const uid = useId().replace(/:/g, "");
  const G = JAR_GEOMETRY;

  return (
    <svg
      viewBox={`0 0 ${JAR_WIDTH} ${JAR_HEIGHT}`}
      className={cn("pointer-events-none block h-full w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`jf-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`jbase-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e0ecf6" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#8fa8be" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      <path d={JAR_OUTLINE_PATH} fill="rgba(240,248,255,0.12)" stroke="none" />

      <path
        d={JAR_LEFT_INNER_SHADOW_PATH}
        fill="none"
        stroke="rgba(55,75,95,0.22)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d={JAR_RIGHT_INNER_SHADOW_PATH}
        fill="none"
        stroke="rgba(55,75,95,0.14)"
        strokeWidth="11"
        strokeLinecap="round"
      />

      <path
        d={JAR_BODY_HIGHLIGHT_PATH}
        fill="none"
        stroke={`url(#jf-${uid})`}
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.78"
      />
      <path
        d={`M ${G.bodyRight - 36} ${G.bodyTop + 22} L ${G.bodyRight - 40} ${G.bodyBottom - 34}`}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d={JAR_BASE_PATH}
        fill={`url(#jbase-${uid})`}
        stroke="rgba(110,135,158,0.6)"
        strokeWidth="2"
      />
      <path
        d={`M ${G.bodyLeft + 26} ${G.floorY - 4} Q ${G.openingCenterX} ${G.bodyBottom - 12} ${G.bodyRight - 26} ${G.floorY - 4}`}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Front rim lip — single bright arc over the opening */}
      <path
        d={JAR_FRONT_RIM_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d={JAR_FRONT_RIM_PATH}
        fill="none"
        stroke="rgba(90,115,138,0.35)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* One subtle mason thread below the neck */}
      <path
        d={JAR_THREAD_BAND_PATH}
        fill="none"
        stroke="rgba(130,152,172,0.5)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      <path
        d={JAR_OUTLINE_PATH}
        fill="none"
        stroke="#5a7088"
        strokeWidth="2.6"
        opacity="0.9"
      />
      <path
        d={JAR_OUTLINE_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1"
        transform="translate(-0.6, -0.6)"
      />
    </svg>
  );
}
