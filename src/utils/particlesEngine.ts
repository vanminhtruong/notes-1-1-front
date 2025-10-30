import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

let initPromise: Promise<void> | null = null;

export function ensureParticlesEngine(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  }).then(() => undefined);
  return initPromise;
}


