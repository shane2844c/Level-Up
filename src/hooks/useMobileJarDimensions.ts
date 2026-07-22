"use client";

import { useEffect, useState } from "react";
import { JAR_GEOMETRY } from "@/lib/jar-geometry";

const ASPECT = JAR_GEOMETRY.height / JAR_GEOMETRY.width;

export interface MobileJarDimensions {
  jarWidth: number;
  jarHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

function computeDimensions(viewportWidth: number, viewportHeight: number): MobileJarDimensions {
  let jarWidth = Math.min(viewportWidth * 0.84, 380);
  let jarHeight = jarWidth * ASPECT;

  const maxJarHeight = viewportHeight * 0.55;
  if (jarHeight > maxJarHeight) {
    jarHeight = maxJarHeight;
    jarWidth = jarHeight / ASPECT;
  }

  const minJarWidth = Math.min(viewportWidth * 0.62, 260);
  if (jarWidth < minJarWidth) {
    jarWidth = minJarWidth;
    jarHeight = jarWidth * ASPECT;
  }

  return {
    jarWidth: Math.round(jarWidth),
    jarHeight: Math.round(jarHeight),
    viewportWidth,
    viewportHeight,
  };
}

const SSR_VIEWPORT_WIDTH = 390;
const SSR_VIEWPORT_HEIGHT = 844;
const SSR_JAR_DIMENSIONS = computeDimensions(SSR_VIEWPORT_WIDTH, SSR_VIEWPORT_HEIGHT);

export function useMobileJarDimensions(): MobileJarDimensions {
  // Match server HTML on first render; measure real viewport after hydration.
  const [dims, setDims] = useState<MobileJarDimensions>(SSR_JAR_DIMENSIONS);

  useEffect(() => {
    const update = () => {
      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setDims(computeDimensions(vw, vh));
    };

    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);

    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return dims;
}
