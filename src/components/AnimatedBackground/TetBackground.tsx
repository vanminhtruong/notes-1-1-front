import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container } from '@tsparticles/engine';

const TetBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Tet particles loaded', container);
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
          value: ['#ff0000', '#ffd700', '#ff1744', '#ffeb3b', '#ff6f00', '#ff4081'],
        },
        move: {
          direction: 'top-right' as const,
          enable: true,
          outModes: {
            default: 'out' as const,
          },
          random: true,
          speed: { min: 3, max: 8 },
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 120,
        },
        opacity: {
          value: { min: 0.6, max: 1 },
          animation: {
            enable: true,
            speed: 3,
            sync: false,
          },
        },
        shape: {
          type: ['circle', 'square', 'triangle', 'star'],
          options: {
            star: {
              sides: 5,
            },
          },
        },
        size: {
          value: { min: 2, max: 12 },
          animation: {
            enable: true,
            speed: 5,
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
            speed: 10,
            sync: false,
          },
        },
        wobble: {
          enable: true,
          distance: 30,
          speed: {
            min: 15,
            max: 30,
          },
        },
        life: {
          duration: {
            value: 3,
          },
          count: 1,
        },
      },
      emitters: {
        position: {
          x: 50,
          y: 100,
        },
        rate: {
          delay: 0.1,
          quantity: 5,
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
        id="tet-particles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    </div>
  );
};

export default TetBackground;
