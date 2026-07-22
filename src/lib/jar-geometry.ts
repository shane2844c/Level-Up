/**
 * Single source of truth for mason-jar SVG paths and Matter.js collision geometry.
 * Logical viewBox: 0 0 420 × 500 — wide storage jar proportions.
 */
export const JAR_GEOMETRY = {
  viewBoxWidth: 420,
  viewBoxHeight: 500,
  width: 420,
  height: 500,

  bodyLeft: 55,
  bodyRight: 365,
  bodyTop: 125,
  bodyBottom: 440,

  neckLeft: 125,
  neckRight: 295,
  neckTop: 50,
  neckBottom: 105,

  openingCenterX: 210,
  openingCenterY: 52,
  openingRadiusX: 86,
  openingRadiusY: 21,

  floorY: 420,

  coinRadius: 12,
  maxPhysicsCoins: 50,
  spawnY: 56,
  spawnCenterX: 210,

  opening: { cx: 210, cy: 52, rx: 86, ry: 21 },
  footprint: { cx: 210, cy: 486, rx: 112, ry: 11 },
} as const;

/** Shared mouth / rim / neck / shoulder geometry for SVG layers */
export const JAR_MOUTH = {
  centerX: 210,
  centerY: 72,

  outerRadiusX: 82,
  outerRadiusY: 18,

  innerRadiusX: 69,
  innerRadiusY: 11,

  neckLeft: 128,
  neckRight: 292,
  neckTop: 72,
  neckBottom: 116,

  shoulderLeft: 72,
  shoulderRight: 348,
  shoulderY: 150,
} as const;

const G = JAR_GEOMETRY;
const M = JAR_MOUTH;

/** Wide mason jar — smooth shoulders, open mouth (body footprint unchanged) */
export const JAR_OUTLINE_PATH = [
  `M ${G.bodyLeft} ${G.bodyBottom - 8}`,
  `Q ${G.bodyLeft} ${G.bodyBottom + 10} ${G.openingCenterX} ${G.bodyBottom + 16}`,
  `Q ${G.bodyRight} ${G.bodyBottom + 10} ${G.bodyRight} ${G.bodyBottom - 8}`,
  `L ${G.bodyRight} ${G.bodyTop}`,
  `C ${M.shoulderRight} ${M.shoulderY} ${M.neckRight + 16} ${M.neckBottom - 2} ${M.neckRight} ${M.neckBottom}`,
  `L ${M.neckRight} ${M.neckTop + 10}`,
  `A ${M.outerRadiusX} ${M.outerRadiusY} 0 0 1 ${M.neckLeft} ${M.neckTop + 10}`,
  `L ${M.neckLeft} ${M.neckBottom}`,
  `C ${M.neckLeft - 16} ${M.neckBottom - 2} ${M.shoulderLeft} ${M.shoulderY} ${G.bodyLeft} ${G.bodyTop}`,
  "Z",
].join(" ");

/** Interior clip — open through mouth, smooth neck walls */
export const JAR_INTERIOR_CLIP_PATH = [
  `M ${G.bodyLeft + 8} ${G.bodyBottom - 16}`,
  `L ${G.bodyLeft + 8} ${G.bodyTop + 6}`,
  `C ${M.shoulderLeft + 8} ${M.shoulderY - 4} ${M.neckLeft + 10} ${M.neckBottom - 4} ${M.neckLeft + 10} ${M.neckBottom - 2}`,
  `L ${M.neckLeft + 10} ${M.neckTop + 14}`,
  `A ${M.innerRadiusX - 4} ${M.innerRadiusY - 2} 0 0 1 ${M.neckRight - 10} ${M.neckTop + 14}`,
  `L ${M.neckRight - 10} ${M.neckBottom - 2}`,
  `C ${M.neckRight - 10} ${M.neckBottom - 4} ${M.shoulderRight - 8} ${M.shoulderY - 4} ${G.bodyRight - 8} ${G.bodyTop + 6}`,
  `L ${G.bodyRight - 8} ${G.bodyBottom - 16}`,
  `Q ${G.bodyRight - 8} ${G.bodyBottom} ${G.openingCenterX} ${G.bodyBottom - 4}`,
  `Q ${G.bodyLeft + 8} ${G.bodyBottom} ${G.bodyLeft + 8} ${G.bodyBottom - 16}`,
  "Z",
].join(" ");

export const JAR_SHOULDER_REFLECTION_PATH = `M ${M.shoulderLeft + 22} ${M.shoulderY - 8} Q ${G.bodyLeft + 28} ${M.shoulderY + 28} ${G.bodyLeft + 24} ${G.bodyTop + 48}`;

export const JAR_LEFT_INNER_SHADOW_PATH = `M ${G.bodyLeft + 16} ${G.bodyTop + 20} L ${G.bodyLeft + 18} ${G.bodyBottom - 28}`;

export const JAR_RIGHT_INNER_SHADOW_PATH = `M ${G.bodyRight - 16} ${G.bodyTop + 24} L ${G.bodyRight - 18} ${G.bodyBottom - 28}`;

/** Thick glass base band */
export const JAR_BASE_PATH = [
  `M ${G.bodyLeft + 14} ${G.floorY - 8}`,
  `Q ${G.openingCenterX} ${G.bodyBottom - 2} ${G.bodyRight - 14} ${G.floorY - 8}`,
  `L ${G.bodyRight - 20} ${G.bodyBottom - 18}`,
  `Q ${G.openingCenterX} ${G.bodyBottom + 4} ${G.bodyLeft + 20} ${G.bodyBottom - 18}`,
  "Z",
].join(" ");

/** Vertical body highlight — mason jars have straighter sides */
export const JAR_BODY_HIGHLIGHT_PATH = `M ${G.bodyLeft + 32} ${G.bodyTop + 20} L ${G.bodyLeft + 38} ${G.bodyBottom - 40}`;

/** Single subtle mason thread band below the lip */
export const JAR_THREAD_BAND_PATH = `M ${M.neckLeft + 6} ${M.neckBottom - 10} Q ${M.centerX} ${M.neckBottom - 14} ${M.neckRight - 6} ${M.neckBottom - 10}`;

/** Rear glass lip — back arc of outer rim (JarBackSvg) */
export const JAR_REAR_RIM_PATH = `M ${M.centerX - M.outerRadiusX + 4} ${M.centerY + 6} A ${M.outerRadiusX} ${M.outerRadiusY} 0 0 1 ${M.centerX + M.outerRadiusX - 4} ${M.centerY + 6}`;

/** Front glass lip — forward arc catching light (JarFrontSvg) */
export const JAR_FRONT_RIM_PATH = `M ${M.centerX - M.outerRadiusX + 2} ${M.centerY + 2} A ${M.outerRadiusX} ${M.outerRadiusY} 0 0 0 ${M.centerX + M.outerRadiusX - 2} ${M.centerY + 2}`;

/** @deprecated Use JAR_THREAD_BAND_PATH — kept to avoid breaking imports */
export const JAR_RIM_THREAD_PATHS = [JAR_THREAD_BAND_PATH];

export const JAR_WIDTH = JAR_GEOMETRY.width;
export const JAR_HEIGHT = JAR_GEOMETRY.height;
export const COIN_RADIUS = JAR_GEOMETRY.coinRadius;
export const MAX_PHYSICS_COINS = JAR_GEOMETRY.maxPhysicsCoins;
export const JAR_OPENING_Y = JAR_GEOMETRY.spawnY;
export const JAR_OPENING_CENTER_X = JAR_GEOMETRY.spawnCenterX;

export interface JarWallSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

/** Collision walls — mostly vertical body, short neck guides, flat floor */
export function getJarWallSpecs(): JarWallSpec[] {
  const midBodyY = (G.bodyTop + G.bodyBottom) / 2;
  const bodyHeight = G.bodyBottom - G.bodyTop - 36;
  const neckMidY = (G.neckTop + G.neckBottom) / 2;

  return [
    { x: G.openingCenterX, y: G.floorY + 12, width: G.bodyRight - G.bodyLeft - 36, height: 18, angle: 0 },
    { x: G.bodyLeft + 12, y: midBodyY, width: 16, height: bodyHeight, angle: 0 },
    { x: G.bodyRight - 12, y: midBodyY, width: 16, height: bodyHeight, angle: 0 },
    { x: G.neckLeft + 6, y: neckMidY, width: 12, height: G.neckBottom - G.neckTop + 16, angle: 0.24 },
    { x: G.neckRight - 6, y: neckMidY, width: 12, height: G.neckBottom - G.neckTop + 16, angle: -0.24 },
    { x: G.bodyLeft + 28, y: G.bodyTop + 4, width: 14, height: 44, angle: -0.1 },
    { x: G.bodyRight - 28, y: G.bodyTop + 4, width: 14, height: 44, angle: 0.1 },
    { x: G.bodyLeft + 24, y: G.bodyBottom - 32, width: 14, height: 48, angle: -0.06 },
    { x: G.bodyRight - 24, y: G.bodyBottom - 32, width: 14, height: 48, angle: 0.06 },
  ];
}

export function getStackPosition(index: number, _total: number) {
  const cols = 7;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const stackFloor = G.floorY - COIN_RADIUS - 4;
  const rowOffset = row % 2 === 0 ? 0 : 12;
  const innerWidth = G.bodyRight - G.bodyLeft - 56;
  const colSpacing = innerWidth / (cols - 1);
  const x = G.bodyLeft + 28 + col * colSpacing + rowOffset + ((index * 11) % 5) - 2;
  const y = stackFloor - row * 17 - ((index * 7) % 4);
  const minX = G.bodyLeft + 24 + COIN_RADIUS;
  const maxX = G.bodyRight - 24 - COIN_RADIUS;
  return { x: Math.max(minX, Math.min(maxX, x)), y };
}

export function getCoinVariation(seed: number) {
  const s = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  const t = Math.abs(Math.sin(seed * 78.233) * 12345.678) % 1;
  return {
    scale: 1,
    highlight: 0.35 + t * 0.35,
    initialAngle: (s - 0.5) * 1.2,
  };
}

export function coinPerspectiveScale(angle: number) {
  return 0.52 + 0.48 * Math.abs(Math.cos(angle));
}
