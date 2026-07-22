"use client";

import { useId } from "react";
import {
  JAR_BODY_HIGHLIGHT_PATH,
  JAR_GEOMETRY,
  JAR_HEIGHT,
  JAR_INTERIOR_CLIP_PATH,
  JAR_MOUTH,
  JAR_OUTLINE_PATH,
  JAR_REAR_RIM_PATH,
  JAR_SHOULDER_REFLECTION_PATH,
  JAR_WIDTH,
} from "@/lib/jar-geometry";
import { cn } from "@/lib/utils";

interface JarBackSvgProps {
  accentColor: string;
  glowing?: boolean;
  className?: string;
}

/** Rear glass layer — shadow, body fill, interior depth */
export function JarBackSvg({ accentColor, glowing, className }: JarBackSvgProps) {
  const uid = useId().replace(/:/g, "");
  const { cx: fcx, cy: fcy, rx: frx, ry: fry } = JAR_GEOMETRY.footprint;
  const M = JAR_MOUTH;

  return (
    <svg
      viewBox={`0 0 ${JAR_WIDTH} ${JAR_HEIGHT}`}
      className={cn("block h-full w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`jb-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f6fc" stopOpacity="0.55" />
          <stop offset="42%" stopColor="#c5d8ea" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#9eb4cc" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id={`je-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a7088" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#8fa8c0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4a6078" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`ji-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#dceaf6" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#b8cce0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#98b4cc" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={`ja-${uid}`} cx="50%" cy="76%" r="58%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <filter id={`js-${uid}`} x="-35%" y="-15%" width="170%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#64748b" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#js-${uid})`}>
        <ellipse cx={fcx} cy={fcy} rx={frx} ry={fry} fill="rgba(100,116,139,0.24)" />
        <ellipse cx={fcx} cy={fcy - 8} rx={frx * 0.82} ry={fry * 0.55} fill="rgba(71,85,105,0.14)" />
      </g>

      <ellipse cx={210} cy={350} rx={138} ry={108} fill={`url(#ja-${uid})`} opacity={glowing ? 1 : 0.85} />

      <path
        d={JAR_OUTLINE_PATH}
        fill={`url(#jb-${uid})`}
        stroke={`url(#je-${uid})`}
        strokeWidth="3.2"
      />

      <path
        d={JAR_OUTLINE_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.2"
        transform="translate(0.8, 0.8)"
      />

      <path d={JAR_INTERIOR_CLIP_PATH} fill={`url(#ji-${uid})`} />
      <path d={JAR_INTERIOR_CLIP_PATH} fill="rgba(170,198,220,0.16)" />

      {/* Rear rim lip + dark mouth interior (behind coins) */}
      <path
        d={JAR_REAR_RIM_PATH}
        fill="none"
        stroke="rgba(120,145,168,0.55)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse
        cx={M.centerX}
        cy={M.centerY + 8}
        rx={M.innerRadiusX}
        ry={M.innerRadiusY}
        fill="rgba(36,52,68,0.42)"
      />

      <path
        d={JAR_SHOULDER_REFLECTION_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d={JAR_BODY_HIGHLIGHT_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.7"
      />

      <ellipse
        cx={M.centerX - 54}
        cy={268}
        rx="9"
        ry="52"
        fill="rgba(255,255,255,0.1)"
      />
    </svg>
  );
}
