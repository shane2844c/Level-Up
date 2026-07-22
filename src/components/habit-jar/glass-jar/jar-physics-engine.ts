import Matter from "matter-js";
import {
  COIN_RADIUS,
  getCoinVariation,
  getJarWallSpecs,
  getStackPosition,
  JAR_OPENING_CENTER_X,
  JAR_OPENING_Y,
  MAX_PHYSICS_COINS,
} from "@/lib/jar-geometry";
import type { CoinRenderState } from "@/components/habit-jar/glass-jar/types";

const WALL = {
  isStatic: true,
  friction: 0.78,
  restitution: 0.14,
  render: { visible: false },
  label: "wall",
} satisfies Matter.IChamferableBodyDefinition;

const SETTLED = {
  restitution: 0.3,
  friction: 0.6,
  frictionAir: 0.02,
  density: 0.0036,
  label: "coin",
} satisfies Matter.IBodyDefinition;

const DROPPING = {
  restitution: 0.34,
  friction: 0.55,
  frictionAir: 0.016,
  density: 0.004,
  label: "coin",
} satisfies Matter.IBodyDefinition;

const coinSeeds = new WeakMap<Matter.Body, number>();

function sleep(body: Matter.Body, value: boolean) {
  if (value) {
    Matter.Body.setVelocity(body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(body, 0);
  }
  body.isSleeping = value;
}

function attachSeed(body: Matter.Body, seed: number) {
  coinSeeds.set(body, seed);
  const { initialAngle } = getCoinVariation(seed);
  Matter.Body.setAngle(body, initialAngle);
}

export class JarPhysicsEngine {
  private engine: Matter.Engine;
  private runner: Matter.Runner;
  private coins: Matter.Body[] = [];

  constructor(initialTotal: number, private reducedMotion: boolean) {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.00118 },
    });
    this.engine.enableSleeping = true;

    getJarWallSpecs().forEach((wall) => {
      Matter.Composite.add(
        this.engine.world,
        Matter.Bodies.rectangle(wall.x, wall.y, wall.width, wall.height, {
          ...WALL,
          angle: wall.angle,
        })
      );
    });

    const settled = Math.min(Math.max(0, initialTotal), MAX_PHYSICS_COINS);
    for (let i = 0; i < settled; i += 1) {
      this.coins.push(this.createSettledCoin(i, settled, true));
    }

    this.runner = Matter.Runner.create();
    Matter.Runner.run(this.runner, this.engine);
  }

  private createSettledCoin(index: number, total: number, sleeping: boolean) {
    const pos = getStackPosition(index, total);
    const body = Matter.Bodies.circle(pos.x, pos.y, COIN_RADIUS, SETTLED);
    attachSeed(body, index + 1);
    Matter.Composite.add(this.engine.world, body);
    if (sleeping) sleep(body, true);
    return body;
  }

  dropCoin() {
    if (this.reducedMotion) {
      if (this.coins.length >= MAX_PHYSICS_COINS) return;
      this.coins.push(
        this.createSettledCoin(this.coins.length, this.coins.length + 1, true)
      );
      return;
    }

    if (this.coins.length >= MAX_PHYSICS_COINS) {
      this.coins.slice(-8).forEach((body) => sleep(body, false));
      return;
    }

    this.coins.forEach((body) => {
      if (body.isSleeping) sleep(body, false);
    });

    const x = JAR_OPENING_CENTER_X + (Math.random() - 0.5) * 14;
    const body = Matter.Bodies.circle(x, JAR_OPENING_Y, COIN_RADIUS, DROPPING);
    attachSeed(body, Date.now());
    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 2.4,
      y: 1.2,
    });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.28);
    Matter.Composite.add(this.engine.world, body);
    this.coins.push(body);
  }

  removeLastCoin() {
    const last = this.coins.pop();
    if (last) Matter.Composite.remove(this.engine.world, last);
  }

  getCoinStates(): CoinRenderState[] {
    return this.coins.map((body) => ({
      id: body.id,
      x: body.position.x,
      y: body.position.y,
      angle: body.angle,
      seed: coinSeeds.get(body) ?? body.id,
    }));
  }

  destroy() {
    Matter.Runner.stop(this.runner);
    Matter.Engine.clear(this.engine);
    this.coins = [];
  }
}
