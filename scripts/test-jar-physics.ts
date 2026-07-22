/**
 * Smoke test for JarPhysicsEngine — run: npx tsx scripts/test-jar-physics.ts
 */
import { JarPhysicsEngine } from "../src/components/habit-jar/glass-jar/jar-physics-engine";

// Matter.Runner expects browser globals in Node
const g = globalThis as typeof globalThis & {
  window?: Window & typeof globalThis;
};
g.window = g.window ?? (g as unknown as Window & typeof globalThis);
g.window.requestAnimationFrame =
  g.window.requestAnimationFrame ??
  ((cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number);
g.window.cancelAnimationFrame =
  g.window.cancelAnimationFrame ?? ((id: number) => clearTimeout(id));

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const engine = new JarPhysicsEngine(38, false);
let states = engine.getCoinStates();
assert(states.length === 38, `Expected 38 hydrated coins, got ${states.length}`);

engine.dropCoin();
states = engine.getCoinStates();
assert(states.length === 39, `Expected 39 coins after drop, got ${states.length}`);

engine.removeLastCoin();
states = engine.getCoinStates();
assert(states.length === 38, `Expected 38 coins after rollback, got ${states.length}`);

engine.destroy();
console.log("JarPhysicsEngine smoke test passed.");
