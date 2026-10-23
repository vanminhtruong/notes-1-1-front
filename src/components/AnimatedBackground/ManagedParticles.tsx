import { memo, useEffect, useId, useRef } from 'react';
import { tsParticles } from '@tsparticles/engine';
import type { Container, ISourceOptions } from '@tsparticles/engine';
import { ensureParticlesEngine } from '../../utils/particlesEngine';

interface Props {
  id: string;
  options: ISourceOptions;
  particlesLoaded?: (container?: Container) => Promise<void>;
}

// The library's React wrapper only destroys containers whose asynchronous load
// has already finished at cleanup time. Also dispose loads that finish later.
const ManagedParticles = memo(({ id, options, particlesLoaded }: Props) => {
  const instance = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const containerId = `${id}-${instance}`;
  const onLoaded = useRef(particlesLoaded);
  useEffect(() => { onLoaded.current = particlesLoaded; }, [particlesLoaded]);

  useEffect(() => {
    let disposed = false;
    let active: Container | undefined;
    void ensureParticlesEngine().then(async () => {
      // In StrictMode the first effect is cleaned up before this microtask.
      if (disposed) return;
      const container = await tsParticles.load({ id: containerId, options });
      if (disposed) {
        container?.destroy();
        return;
      }
      active = container;
      await onLoaded.current?.(container);
    }).catch(error => {
      if (!disposed) console.error('[AnimatedBackground] Particle loading failed:', error);
    });
    return () => {
      disposed = true;
      active?.destroy();
    };
  }, [containerId, options]);

  return <div id={id}><div id={containerId} /></div>;
});

ManagedParticles.displayName = 'ManagedParticles';
export default ManagedParticles;
