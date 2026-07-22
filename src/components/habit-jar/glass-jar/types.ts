export interface JarPhysicsApi {
  dropCoin: () => void;
  removeLastCoin: () => void;
}

export interface CoinRenderState {
  id: number;
  x: number;
  y: number;
  angle: number;
  seed: number;
}
