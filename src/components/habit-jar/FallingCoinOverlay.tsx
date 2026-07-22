"use client";

import { createPortal } from "react-dom";
import { JarCoin } from "@/components/habit-jar/JarCoin";

interface FallingCoinOverlayProps {
  startX: number;
  startY: number;
  dropDistance: number;
}

export function FallingCoinOverlay({
  startX,
  startY,
  dropDistance,
}: FallingCoinOverlayProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[100] pointer-events-none animate-coin-drop"
      style={{
        left: startX,
        top: startY,
        ["--drop-distance" as string]: `${dropDistance}px`,
      }}
    >
      <JarCoin size="lg" />
    </div>,
    document.body
  );
}
