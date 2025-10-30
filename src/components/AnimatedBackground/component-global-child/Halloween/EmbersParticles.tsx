import { memo } from 'react';
import Particles from '@tsparticles/react';
import type { Container, ISourceOptions } from '@tsparticles/engine';

interface Props {
  options: ISourceOptions;
  particlesLoaded: (container?: Container) => Promise<void>;
}

const EmbersParticles = memo(({ options, particlesLoaded }: Props) => (
  <div className="absolute inset-0" style={{ zIndex: 3 }}>
    <Particles id="halloween-embers" particlesLoaded={particlesLoaded} options={options} />
  </div>
));

EmbersParticles.displayName = 'EmbersParticles';

export default EmbersParticles;
