import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container } from '@tsparticles/engine';

const EasterBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Easter particles loaded', container);
  };

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: ['#ff69b4', '#87ceeb', '#98fb98', '#ffd700', '#dda0dd', '#ffb6c1', '#e6e6fa'],
        },
        move: {
          direction: 'top' as const,
          enable: true,
          outModes: {
            default: 'out' as const,
          },
          random: true,
          speed: { min: 0.5, max: 2 },
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 80,
        },
        opacity: {
          value: { min: 0.5, max: 0.9 },
          animation: {
            enable: true,
            speed: 1.5,
            sync: false,
          },
        },
        shape: {
          type: ['circle', 'square'],
        },
        size: {
          value: { min: 3, max: 10 },
          animation: {
            enable: true,
            speed: 3,
            sync: false,
          },
        },
        rotate: {
          value: {
            min: 0,
            max: 360,
          },
          animation: {
            enable: true,
            speed: 5,
            sync: false,
          },
        },
        wobble: {
          enable: true,
          distance: 15,
          speed: {
            min: 8,
            max: 15,
          },
        },
        bounce: {
          horizontal: {
            value: 1,
          },
          vertical: {
            value: 1,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Particles
        id="easter-particles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    </div>
  );
};

export default EasterBackground;
