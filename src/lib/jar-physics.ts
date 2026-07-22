import Matter from "matter-js";
import {
  COIN_RADIUS,
  getCoinVariation,
  getJarWallSpecs,
  getStackPosition,
  JAR_GEOMETRY,
  JAR_OPENING_CENTER_X,
  JAR_OPENING_Y,
  MAX_PHYSICS_COINS,
} from "@/lib/jar-geometry";

export {
  COIN_RADIUS,
  JAR_GEOMETRY,
  JAR_HEIGHT,
  JAR_INTERIOR_CLIP_PATH,
  JAR_OPENING_CENTER_X,
  JAR_OPENING_Y,
  JAR_OUTLINE_PATH,
  JAR_WIDTH,
  MAX_PHYSICS_COINS,
  coinPerspectiveScale,
  getCoinVariation,
  getStackPosition,
} from "@/lib/jar-geometry";

export interface CoinBodyMeta {
  scale: number;
  highlight: number;
  seed: number;
}

const coinMetaStore = new WeakMap<Matter.Body, CoinBodyMeta>();

export function getCoinBodyMeta(body: Matter.Body): CoinBodyMeta {
  return (
    coinMetaStore.get(body) ?? {
      scale: 1,
      highlight: 0.5,
      seed: 0,
    }
  );
}

const wallOptions: Matter.IChamferableBodyDefinition = {
  isStatic: true,
  friction: 0.75,
  restitution: 0.12,
  render: { visible: false },
  label: "wall",
};

const COIN_PHYSICS = {
  settled: {
    restitution: 0.28,
    friction: 0.58,
    frictionAir: 0.022,
    density: 0.0036,
  },
  dropping: {
    restitution: 0.32,
    friction: 0.55,
    frictionAir: 0.018,
    density: 0.004,
  },
} as const;

export function createJarWorld(world: Matter.World, scale = 1) {
  const walls = getJarWallSpecs().map((spec) =>
    Matter.Bodies.rectangle(
      spec.x * scale,
      spec.y * scale,
      spec.width * scale,
      spec.height * scale,
      { ...wallOptions, angle: spec.angle }
    )
  );
  Matter.Composite.add(world, walls);
  return world;
}

export function setBodySleeping(body: Matter.Body, sleeping: boolean) {
  if (sleeping) {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
  }
  body.isSleeping = sleeping;
}

function attachCoinMeta(body: Matter.Body, seed: number) {
  const variation = getCoinVariation(seed);
  coinMetaStore.set(body, {
    scale: 1,
    highlight: variation.highlight,
    seed,
  });
  Matter.Body.setAngle(body, variation.initialAngle);
}

export function spawnSettledCoin(
  world: Matter.World,
  index: number,
  total: number,
  sleeping = true,
  scale = 1
) {
  const pos = getStackPosition(index, total);
  const body = Matter.Bodies.circle(
    pos.x * scale,
    pos.y * scale,
    COIN_RADIUS * scale,
    {
      ...COIN_PHYSICS.settled,
      label: "coin",
    }
  );
  attachCoinMeta(body, index + 1);
  Matter.Composite.add(world, body);
  if (sleeping) setBodySleeping(body, true);
  return body;
}

export function spawnDroppingCoin(world: Matter.World, scale = 1, seed?: number) {
  const x =
    JAR_OPENING_CENTER_X * scale + (Math.random() - 0.5) * 12 * scale;
  const body = Matter.Bodies.circle(
    x,
    JAR_OPENING_Y * scale,
    COIN_RADIUS * scale,
    {
      ...COIN_PHYSICS.dropping,
      label: "coin",
    }
  );
  attachCoinMeta(body, seed ?? Date.now());
  Matter.Body.setVelocity(body, {
    x: (Math.random() - 0.5) * 2.2 * scale,
    y: 0.8 * scale,
  });
  Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
  Matter.Composite.add(world, body);
  return body;
}

export function wakeCoins(bodies: Matter.Body[]) {
  bodies.forEach((body) => {
    if (body.isSleeping) setBodySleeping(body, false);
  });
}

export function scaleJarBodies(
  bodies: Matter.Body[],
  walls: Matter.Body[],
  oldScale: number,
  newScale: number
) {
  if (oldScale === newScale || oldScale <= 0) return;
  const ratio = newScale / oldScale;

  [...walls, ...bodies].forEach((body) => {
    Matter.Body.scale(body, ratio, ratio);
    Matter.Body.setPosition(body, {
      x: body.position.x * ratio,
      y: body.position.y * ratio,
    });
  });
}
