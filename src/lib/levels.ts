export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 900 },
  { level: 6, xp: 1400 },
  { level: 7, xp: 2000 },
  { level: 8, xp: 2750 },
  { level: 9, xp: 3650 },
  { level: 10, xp: 5000 },
] as const;

export const MAX_LEVEL = 10;

export type LevelThreshold = (typeof LEVEL_THRESHOLDS)[number];

export interface LevelProgress {
  level: number;
  tier: string;
  currentLevelMinXp: number;
  nextLevelThreshold: number | null;
  progressPercent: number;
  xpRemaining: number;
  isMaxLevel: boolean;
}

export function getTierName(level: number): string {
  if (level <= 2) return "Beginner";
  if (level <= 4) return "Developing";
  if (level <= 6) return "Disciplined";
  if (level <= 8) return "Advanced";
  if (level === 9) return "Elite";
  return "Master";
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXp >= threshold.xp) {
      level = threshold.level;
    }
  }
  return level;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = getLevelFromXp(totalXp);
  const tier = getTierName(level);
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level)!;
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);
  const isMaxLevel = level >= MAX_LEVEL;

  if (isMaxLevel || !nextThreshold) {
    return {
      level,
      tier,
      currentLevelMinXp: currentThreshold.xp,
      nextLevelThreshold: null,
      progressPercent: 100,
      xpRemaining: 0,
      isMaxLevel: true,
    };
  }

  const xpInLevel = totalXp - currentThreshold.xp;
  const xpNeeded = nextThreshold.xp - currentThreshold.xp;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const xpRemaining = nextThreshold.xp - totalXp;

  return {
    level,
    tier,
    currentLevelMinXp: currentThreshold.xp,
    nextLevelThreshold: nextThreshold.xp,
    progressPercent,
    xpRemaining,
    isMaxLevel: false,
  };
}
