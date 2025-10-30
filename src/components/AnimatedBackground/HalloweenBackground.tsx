import { useEffect, useMemo, useState, memo } from 'react';
import type { Container } from '@tsparticles/engine';
import { ensureParticlesEngine } from '../../utils/particlesEngine';
import BatsSwarm from './component-global-child/Halloween/BatsSwarm';
import NightSkyGradient from './component-global-child/Halloween/NightSkyGradient';
import MoonAndClouds from './component-global-child/Halloween/MoonAndClouds';
import GlobalHalloweenAnimations from './component-global-child/Halloween/GlobalHalloweenAnimations';
import FogLayers from './component-global-child/Halloween/FogLayers';
import LightningFlash from './component-global-child/Halloween/LightningFlash';
import FallingLeaves from './component-global-child/Halloween/FallingLeaves';
import EmbersParticles from './component-global-child/Halloween/EmbersParticles';
import BatsSilhouetteParticles from './component-global-child/Halloween/BatsSilhouetteParticles';
import MidgroundTrees from './component-global-child/Halloween/MidgroundTrees';
import Graveyard from './component-global-child/Halloween/Graveyard';
import PumpkinsLayer from './component-global-child/Halloween/PumpkinsLayer';
import HousesCluster from './component-global-child/Halloween/HousesCluster';
import FenceLayer from './component-global-child/Halloween/FenceLayer';
import Ghosts from './component-global-child/Halloween/Ghosts';
import Spiders from './component-global-child/Halloween/Spiders';
import OwlOnBranch from './component-global-child/Halloween/OwlOnBranch';
import WitchFlying from './component-global-child/Halloween/WitchFlying';
import BlackCatWalking from './component-global-child/Halloween/BlackCatWalking';
import DeadTrees from './component-global-child/Halloween/DeadTrees';

const HalloweenBackground = memo(() => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureParticlesEngine().then(() => {
      if (mounted) setInit(true);
    });
    return () => { mounted = false; };
  }, []);

  const particlesLoaded = async (_?: Container): Promise<void> => {};

  const batsOptions = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        color: { value: ['#2b2b2b', '#3a3a3a', '#1f1f1f'] },
        move: {
          enable: true,
          outModes: { default: 'out' as const },
          speed: { min: 1.2, max: 3.2 },
          direction: 'right' as const,
          angle: { offset: 0, value: 15 },
        },
        number: { value: 0 },
        opacity: { value: { min: 0.6, max: 0.9 } },
        shape: { type: ['triangle'] },
        size: { value: { min: 2, max: 6 } },
        rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 20 } },
        wobble: { enable: true, distance: 10, speed: { min: 6, max: 14 } },
        life: { duration: { value: { min: 3, max: 6 } }, count: 1 },
        shadow: { enable: true, blur: 2, color: '#000000' },
      },
      emitters: [
        { position: { x: 0, y: 20 }, rate: { delay: 0.5, quantity: 2 } },
        { position: { x: 0, y: 40 }, rate: { delay: 0.6, quantity: 2 } },
        { position: { x: 0, y: 60 }, rate: { delay: 0.8, quantity: 2 } },
        { position: { x: 0, y: 80 }, rate: { delay: 0.9, quantity: 2 } },
      ],
    }),
    []
  );

  const embersOptions = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        color: { value: ['#ff8400', '#ffb300', '#ff4800'] },
        move: { enable: true, direction: 'top' as const, outModes: { default: 'out' as const }, speed: { min: 0.2, max: 0.8 } },
        number: { value: 90, density: { enable: true } },
        opacity: { value: { min: 0.2, max: 0.8 } },
        size: { value: { min: 0.8, max: 2.2 } },
        twinkle: { particles: { enable: true, opacity: 0.6 } },
      },
    }),
    []
  );

  if (!init) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Night gradient sky */}
      <NightSkyGradient />

      {/* Moon and clouds */}
      <MoonAndClouds />

      {/* Fog layers */}
      <GlobalHalloweenAnimations />
      <FogLayers />

      {/* Lightning flash */}
      <LightningFlash />

      {/* Falling leaves */}
      <FallingLeaves />

      {/* Particles: embers */}
      <EmbersParticles options={embersOptions} particlesLoaded={particlesLoaded} />

      {/* Particles: bats silhouettes */}
      <BatsSilhouetteParticles options={batsOptions} particlesLoaded={particlesLoaded} />

      {/* Mid-ground trees silhouette */}
      <MidgroundTrees />

      {/* Dead Trees - spooky silhouettes */}
      <DeadTrees />

      {/* Graveyard silhouette */}
      <Graveyard />

      {/* Pumpkins layer - inside fence, above houses */}
      <PumpkinsLayer />

      {/* Haunted houses cluster - Victorian Gothic style */}
      <HousesCluster />

      {/* Fence layer - above pumpkins */}
      <FenceLayer />

      {/* Ghosts */}
      <Ghosts />

      {/* Professional Spiders with detailed webs */}
      <Spiders />

      {/* Bats flying out from haunted houses */}
      <BatsSwarm />

      {/* Owl on tree branch */}
      <OwlOnBranch />

      {/* Witch flying across moon */}
      <WitchFlying />

      {/* Black cat walking */}
      <BlackCatWalking />
    </div>
  );
});

HalloweenBackground.displayName = 'HalloweenBackground';

export default HalloweenBackground;


