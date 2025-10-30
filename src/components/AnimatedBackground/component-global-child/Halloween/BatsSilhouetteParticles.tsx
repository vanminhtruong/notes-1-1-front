import { memo } from 'react';
import Particles from '@tsparticles/react';
import type { Container, ISourceOptions } from '@tsparticles/engine';

interface Props {
  options: ISourceOptions;
  particlesLoaded: (container?: Container) => Promise<void>;
}

const BatsSilhouetteParticles = memo(({ options, particlesLoaded }: Props) => (
  <div className="absolute inset-0" style={{ zIndex: 4 }}>
    <Particles id="halloween-bats" particlesLoaded={particlesLoaded} options={options} />
  </div>
));

BatsSilhouetteParticles.displayName = 'BatsSilhouetteParticles';

export default BatsSilhouetteParticles;
