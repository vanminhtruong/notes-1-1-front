import { useEffect, useMemo, useState } from 'react';
import Particles from '@tsparticles/react';
import type { Container } from '@tsparticles/engine';
import { ensureParticlesEngine } from '../../utils/particlesEngine';

const TetBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureParticlesEngine().then(() => {
      if (mounted) setInit(true);
    });
    return () => { mounted = false; };
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Tet particles loaded', container);
  };

  const options = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        color: { value: ['#ff0000', '#ffd700', '#ff1744', '#ffeb3b', '#ff6f00', '#ff4081', '#ff9e00'] },
        move: {
          enable: true,
          gravity: { enable: false },
          outModes: { default: 'out' as const },
          speed: { min: 2, max: 10 },
          angle: { offset: 0, value: 360 },
        },
        number: { value: 0 },
        opacity: {
          value: { min: 0.4, max: 1 },
          animation: { enable: true, speed: 2, sync: false },
        },
        shape: {
          type: ['circle', 'square', 'star'],
          options: { star: { sides: 5 } },
        },
        size: {
          value: { min: 2, max: 14 },
          animation: { enable: true, speed: 6, sync: false },
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: { enable: true, speed: 20, sync: false },
        },
        wobble: { enable: true, distance: 40, speed: { min: 10, max: 35 } },
        life: { duration: { sync: false, value: { min: 2, max: 4 } }, count: 1 },
        links: { enable: false },
        shadow: { enable: false },
        trail: { enable: true, length: 6, fillColor: '#000000' },
        twinkle: { particles: { enable: true, opacity: 0.6 } },
      },
      emitters: [
        // Center-bottom bursts
        {
          position: { x: 50, y: 100 },
          rate: { delay: 0.15, quantity: 12 },
          life: { duration: 0, count: 0 },
          size: { width: 0, height: 0 },
          particles: {
            move: { speed: { min: 6, max: 12 } },
            size: { value: { min: 3, max: 8 } },
            life: { duration: { value: { min: 1.2, max: 2.2 } } },
            opacity: { value: { min: 0.6, max: 1 } },
          },
        },
        // Left-bottom arcing
        {
          position: { x: 10, y: 100 },
          rate: { delay: 0.2, quantity: 8 },
          life: { duration: 0, count: 0 },
          particles: {
            move: { angle: { value: 75 }, speed: { min: 5, max: 10 } },
            size: { value: { min: 2, max: 6 } },
          },
        },
        // Right-bottom arcing
        {
          position: { x: 90, y: 100 },
          rate: { delay: 0.2, quantity: 8 },
          life: { duration: 0, count: 0 },
          particles: {
            move: { angle: { value: 105 }, speed: { min: 5, max: 10 } },
            size: { value: { min: 2, max: 6 } },
          },
        },
        // Gentle confetti from top
        {
          position: { x: 50, y: 0 },
          rate: { delay: 0.6, quantity: 4 },
          life: { duration: 0, count: 0 },
          particles: {
            move: { direction: 'bottom' as const, speed: { min: 1, max: 2.5 } },
            size: { value: { min: 2, max: 4 } },
            opacity: { value: { min: 0.4, max: 0.8 } },
          },
        },
      ],
    }),
    []
  );

  if (!init) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Soft radial glow backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(255,215,0,0.15) 0%, rgba(255,0,0,0.08) 40%, rgba(0,0,0,0) 70%)',
          zIndex: 0,
        }}
      />

      {/* Fireworks / confetti */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <Particles id="tet-particles" particlesLoaded={particlesLoaded} options={options} />
      </div>

      {/* City skyline silhouette */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 2, height: 140 }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skyline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1200" height="140" fill="url(#skyline)" />
          <g fill="#0d0d0d">
            <rect x="0" y="70" width="120" height="70" />
            <rect x="130" y="50" width="90" height="90" />
            <rect x="240" y="40" width="140" height="100" />
            <rect x="400" y="65" width="100" height="75" />
            <rect x="520" y="30" width="120" height="110" />
            <rect x="660" y="60" width="110" height="80" />
            <rect x="790" y="45" width="140" height="95" />
            <rect x="950" y="55" width="110" height="85" />
            <rect x="1070" y="35" width="130" height="105" />
          </g>
        </svg>
      </div>

      {/* Floating lanterns */}
      <style>
        {`
          @keyframes lanternFloat {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.85; }
            50% { transform: translateY(-30px) translateX(8px) rotate(1deg); opacity: 1; }
            100% { transform: translateY(-60px) translateX(0) rotate(-1deg); opacity: 0.9; }
          }
          @keyframes lanternSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
        `}
      </style>
      {[
        { left: '8%', bottom: 40, size: 42, delay: 0 },
        { left: '18%', bottom: 70, size: 36, delay: 1.2 },
        { left: '30%', bottom: 50, size: 48, delay: 0.6 },
        { left: '70%', bottom: 60, size: 40, delay: 0.3 },
        { left: '82%', bottom: 35, size: 46, delay: 1.5 },
      ].map((l, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: l.left as string, bottom: l.bottom, zIndex: 3, animation: `lanternFloat 6s ease-in-out ${l.delay}s infinite alternate` }}
        >
          <div
            className="rounded-t-full rounded-b-md"
            style={{
              width: l.size,
              height: l.size * 1.2,
              background: 'linear-gradient(180deg, #ffdd55 0%, #ff9900 100%)',
              boxShadow: '0 6px 20px rgba(255,170,0,0.35), inset 0 0 18px rgba(255,255,200,0.6)',
              transformOrigin: 'top center',
              animation: 'lanternSway 4s ease-in-out infinite',
            }}
          >
            <div style={{ width: '100%', height: 6, background: '#cc7a00', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
            <div style={{ width: '50%', height: 6, background: '#ffcc66', margin: '6px auto 0', borderRadius: 3, opacity: 0.9 }} />
          </div>
        </div>
      ))}

      {/* New Year greeting text */}
      <div className="absolute top-6 w-full text-center" style={{ zIndex: 4 }}>
        <div
          className="mx-auto px-4 py-1 rounded-full"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, rgba(255,215,0,0.18), rgba(255,0,0,0.18))',
            boxShadow: '0 0 24px rgba(255, 0, 0, 0.18)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <span className="text-sm md:text-base font-semibold" style={{ color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.35)' }}>
            Chúc Mừng Năm Mới · Happy New Year
          </span>
        </div>
      </div>
    </div>
  );
};

export default TetBackground;
