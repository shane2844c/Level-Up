import {
  getLevelFromXp,
  getLevelProgress,
  getTierName,
  getCrossedLevels,
  isBadgeTierLevel,
  validateHabitXp,
  LEVEL_THRESHOLDS,
  MAX_LEVEL_XP,
} from "@/lib/levels";

function assertLevel(xp: number, expectedLevel: number, expectedTier: string) {
  const level = getLevelFromXp(xp);
  const progress = getLevelProgress(xp);
  if (level !== expectedLevel) {
    throw new Error(`XP ${xp}: expected level ${expectedLevel}, got ${level}`);
  }
  if (progress.tier !== expectedTier) {
    throw new Error(`XP ${xp}: expected tier ${expectedTier}, got ${progress.tier}`);
  }
  if (getTierName(level) !== expectedTier) {
    throw new Error(`XP ${xp}: getTierName mismatch`);
  }
}

// Boundary tests from spec
assertLevel(0, 1, "Beginner");
assertLevel(149, 1, "Beginner");
assertLevel(150, 2, "Beginner");
assertLevel(399, 2, "Beginner");
assertLevel(400, 3, "Developing");
assertLevel(749, 3, "Developing");
assertLevel(750, 4, "Developing");
assertLevel(1250, 5, "Disciplined");
assertLevel(1900, 6, "Disciplined");
assertLevel(2750, 7, "Advanced");
assertLevel(3850, 8, "Advanced");
assertLevel(5200, 9, "Elite");
assertLevel(7000, 10, "Master");
assertLevel(99999, 10, "Master");

// Progress within level: 1500 XP = Level 5, 250/650
const p1500 = getLevelProgress(1500);
if (p1500.level !== 5) throw new Error("1500 XP should be level 5");
if (p1500.xpInLevel !== 250) throw new Error(`xpInLevel: ${p1500.xpInLevel}`);
if (p1500.xpRequiredInLevel !== 650) throw new Error(`xpRequired: ${p1500.xpRequiredInLevel}`);
if (p1500.xpRemaining !== 400) throw new Error(`xpRemaining: ${p1500.xpRemaining}`);

// Max level state
const pMax = getLevelProgress(7000);
if (!pMax.isMaxLevel) throw new Error("7000 should be max level");
if (pMax.xpRemaining !== 0) throw new Error("max level should have 0 remaining");
if (pMax.progressPercent !== 100) throw new Error("max level should be 100%");

// Crossed levels
const crossed = getCrossedLevels(1200, 1300);
if (!crossed.includes(5)) throw new Error("Should cross level 5");

// Badge tiers
if (!isBadgeTierLevel(3)) throw new Error("3 is badge tier");
if (!isBadgeTierLevel(10)) throw new Error("10 is badge tier");
if (isBadgeTierLevel(4)) throw new Error("4 is not badge tier");

// XP validation
if (validateHabitXp(4) === null) throw new Error("4 should fail");
if (validateHabitXp(51) === null) throw new Error("51 should fail");
if (validateHabitXp(20) !== null) throw new Error("20 should pass");

if (LEVEL_THRESHOLDS[9].xp !== MAX_LEVEL_XP) throw new Error("MAX_LEVEL_XP mismatch");

console.log("All level curve tests passed.");
