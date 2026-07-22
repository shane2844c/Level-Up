"use client";

import { useCallback, useRef } from "react";
import type { JarPhysicsApi } from "@/components/habit-jar/glass-jar/types";

/** Maps habit IDs to live physics APIs for the active jar carousel slide */
export function useJarPhysicsRegistry() {
  const registry = useRef<Map<string, JarPhysicsApi>>(new Map());
  const pendingDrops = useRef<Set<string>>(new Set());

  const registerPhysics = useCallback((habitId: string, api: JarPhysicsApi | null) => {
    if (api) {
      registry.current.set(habitId, api);
      if (pendingDrops.current.has(habitId)) {
        pendingDrops.current.delete(habitId);
        api.dropCoin();
      }
    } else {
      registry.current.delete(habitId);
      pendingDrops.current.delete(habitId);
    }
  }, []);

  const dropCoin = useCallback((habitId: string) => {
    const api = registry.current.get(habitId);
    if (api) {
      api.dropCoin();
      pendingDrops.current.delete(habitId);
      return;
    }
    pendingDrops.current.add(habitId);
  }, []);

  const removeLastCoin = useCallback((habitId: string) => {
    pendingDrops.current.delete(habitId);
    registry.current.get(habitId)?.removeLastCoin();
  }, []);

  return { registerPhysics, dropCoin, removeLastCoin };
}

export type { JarPhysicsApi };
