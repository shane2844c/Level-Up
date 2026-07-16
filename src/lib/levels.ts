export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, tier: "Beginner" },
  { level: 2, xp: 150, tier: "Beginner" },
  { level: 3, xp: 400, tier: "Developing" },
  { level: 4, xp: 750, tier: "Developing" },
  { level: 5, xp: 1250, tier: "Disciplined" },
  { level: 6, xp: 1900, tier: "Disciplined" },
  { level: 7, xp: 2750, tier: "Advanced" },
  { level: 8, xp: 3850, tier: "Advanced" },
  { level: 9, xp: 5200, tier: "Elite" },
  { level: 10, xp: 7000, tier: "Master" },
] as const;

export const MAX_LEVEL = 10;
export const MAX_LEVEL_XP = 7000;
export const MIN_HABIT_XP = 5;
export const MAX_HABIT_XP = 50;

/** Levels that unlock a new badge tier */
export const BADGE_TIER_LEVELS = [3, 5, 7, 9, 10] as const;

export type LevelThreshold = (typeof LEVEL_THRESHOLDS)[number];
export type TierName = LevelThreshold["tier"];

export interface LevelProgress {
  level: number;
  tier: TierName;
  currentLevelMinXp: number;
  nextLevelThreshold: number | null;
  xpInLevel: number;
  xpRequiredInLevel: number;
  progressPercent: number;
  xpRemaining: number;
  isMaxLevel: boolean;
}

export function getTierName(level: number): TierName {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  return threshold?.tier ?? "Master";
}

export function isBadgeTierLevel(level: number): boolean {
  return (BADGE_TIER_LEVELS as readonly number[]).includes(level);
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

export function getLevelsGained(totalXp: number): number {
  return getLevelFromXp(totalXp) - 1;
}

export function getCrossedLevels(xpBefore: number, xpAfter: number): number[] {
  const crossed: number[] = [];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (threshold.level >= 2 && xpBefore < threshold.xp && xpAfter >= threshold.xp) {
      crossed.push(threshold.level);
    }
  }
  return crossed;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = getLevelFromXp(totalXp);
  const tier = getTierName(level);
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level)!;
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);
  const isMaxLevel = level >= MAX_LEVEL || totalXp >= MAX_LEVEL_XP;

  if (isMaxLevel || !nextThreshold) {
    return {
      level,
      tier,
      currentLevelMinXp: currentThreshold.xp,
      nextLevelThreshold: null,
      xpInLevel: Math.max(0, totalXp - currentThreshold.xp),
      xpRequiredInLevel: 0,
      progressPercent: 100,
      xpRemaining: 0,
      isMaxLevel: true,
    };
  }

  const xpInLevel = totalXp - currentThreshold.xp;
  const xpRequiredInLevel = nextThreshold.xp - currentThreshold.xp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInLevel / xpRequiredInLevel) * 100))
  );
  const xpRemaining = nextThreshold.xp - totalXp;

  return {
    level,
    tier,
    currentLevelMinXp: currentThreshold.xp,
    nextLevelThreshold: nextThreshold.xp,
    xpInLevel,
    xpRequiredInLevel,
    progressPercent,
    xpRemaining,
    isMaxLevel: false,
  };
}

export function validateHabitXp(xp: number): string | null {
  if (!Number.isInteger(xp)) return "XP must be a whole number.";
  if (xp < MIN_HABIT_XP || xp > MAX_HABIT_XP) {
    return `XP must be between ${MIN_HABIT_XP} and ${MAX_HABIT_XP}.`;
  }
  return null;
}
