import { useEffect, useMemo, useState, memo } from 'react';
import Particles from '@tsparticles/react';
import type { Container } from '@tsparticles/engine';
import { ensureParticlesEngine } from '../../utils/particlesEngine';

const EasterBackground = memo(() => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureParticlesEngine().then(() => {
      if (mounted) setInit(true);
    });
    return () => { mounted = false; };
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Easter particles loaded', container);
  };

  const options = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        color: {
          value: ['#ffd1dc', '#b5e0ff', '#c8f7c5', '#fff0b3', '#e6ccff', '#ffdde1', '#e6e6fa'],
        },
        move: {
          enable: true,
          outModes: { default: 'out' as const },
          speed: { min: 0.6, max: 2.2 },
          direction: 'top' as const,
          angle: { offset: 0, value: 20 },
        },
        number: { value: 0 },
        opacity: { value: { min: 0.5, max: 0.9 }, animation: { enable: true, speed: 1.2 } },
        shape: { type: ['circle', 'square', 'triangle'] },
        size: { value: { min: 2, max: 10 }, animation: { enable: true, speed: 2.5 } },
        rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 4 } },
        wobble: { enable: true, distance: 12, speed: { min: 6, max: 12 } },
        life: { duration: { value: { min: 2, max: 3.5 } }, count: 1 },
        trail: { enable: false },
        twinkle: { particles: { enable: true, opacity: 0.5 } },
      },
      emitters: [
        // Gentle pastel confetti from bottom center
        { position: { x: 50, y: 100 }, rate: { delay: 0.25, quantity: 10 } },
        // Side soft emitters
        { position: { x: 15, y: 100 }, rate: { delay: 0.4, quantity: 6 }, particles: { move: { angle: { value: 75 } } } },
        { position: { x: 85, y: 100 }, rate: { delay: 0.4, quantity: 6 }, particles: { move: { angle: { value: 105 } } } },
      ],
    }),
    []
  );

  if (!init) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Soft spring sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(181,224,255,0.18) 0%, rgba(255,209,220,0.12) 35%, rgba(0,0,0,0) 70%)',
          zIndex: 0,
        }}
      />

      {/* Particles: pastel confetti */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <Particles id="easter-particles" particlesLoaded={particlesLoaded} options={options} />
      </div>

      {/* Meadow hills and bunny silhouette */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 2, height: 150 }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#123" stopOpacity="0" />
              <stop offset="100%" stopColor="#062" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 120 C 200 80, 400 160, 600 120 C 800 80, 1000 160, 1200 120 L 1200 150 L 0 150 Z" fill="#0f3d0f" />
          <path d="M0 135 C 220 105, 420 165, 620 135 C 820 105, 1020 165, 1200 135 L 1200 150 L 0 150 Z" fill="#0c330c" />
          <g fill="#0a2a0a">
            <circle cx="260" cy="118" r="12" />
            <circle cx="280" cy="124" r="9" />
            <circle cx="890" cy="122" r="11" />
          </g>
          {/* Bunny silhouette */}
          <g transform="translate(980,88) scale(0.9)" fill="#0a0a0a">
            <circle cx="20" cy="28" r="16" />
            <circle cx="40" cy="42" r="22" />
            <rect x="16" y="0" width="10" height="24" rx="5" />
            <rect x="26" y="-4" width="10" height="26" rx="5" transform="rotate(10 31 9)" />
          </g>
        </svg>
      </div>

      {/* Bunting garlands */}
      <div className="absolute left-0 right-0" style={{ top: 24, zIndex: 3 }}>
        <svg width="100%" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0 10 C 300 40, 900 0, 1200 20" stroke="#ffb6c1" strokeWidth="2" fill="transparent" />
          {Array.from({ length: 20 }).map((_, i) => (
            <path key={i} d={`M${i*60+20} 10 L ${i*60+40} 30 L ${i*60} 30 Z`} fill={i % 3 === 0 ? '#ffd1dc' : i % 3 === 1 ? '#b5e0ff' : '#c8f7c5'} />
          ))}
        </svg>
      </div>

      {/* Floating decorated eggs */}
      <style>
        {`
          @keyframes eggFloat {
            0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.9; }
            50% { transform: translateY(-20px) translateX(6px) rotate(2deg); opacity: 1; }
            100% { transform: translateY(-40px) translateX(0) rotate(-2deg); opacity: 0.95; }
          }
        `}
      </style>
      {[
        { left: '12%', bottom: 50, w: 36, h: 48, c1: '#ffd1dc', c2: '#ffb6c1', delay: 0 },
        { left: '28%', bottom: 65, w: 30, h: 42, c1: '#b5e0ff', c2: '#87ceeb', delay: 0.8 },
        { left: '72%', bottom: 60, w: 34, h: 46, c1: '#c8f7c5', c2: '#98fb98', delay: 0.4 },
        { left: '86%', bottom: 48, w: 32, h: 44, c1: '#fff0b3', c2: '#ffe680', delay: 1.1 },
      ].map((e, i) => (
        <div key={i} className="absolute" style={{ left: e.left as string, bottom: e.bottom, zIndex: 4, animation: `eggFloat 7s ease-in-out ${e.delay}s infinite alternate` }}>
          <div style={{ width: e.w, height: e.h, borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%', background: `linear-gradient(180deg, ${e.c1}, ${e.c2})`, boxShadow: '0 6px 18px rgba(0,0,0,0.25), inset 0 0 10px rgba(255,255,255,0.35)' }} />
        </div>
      ))}

      {/* Greeting */}
      <div className="absolute top-6 w-full text-center" style={{ zIndex: 5 }}>
        <div className="mx-auto px-4 py-1 rounded-full" style={{ display: 'inline-block', background: 'linear-gradient(90deg, rgba(181,224,255,0.22), rgba(255,209,220,0.22))', boxShadow: '0 0 18px rgba(255, 192, 203, 0.18)', backdropFilter: 'blur(2px)' }}>
          <span className="text-sm md:text-base font-semibold" style={{ color: '#ffb6c1', textShadow: '0 0 10px rgba(255,182,193,0.35)' }}>
            Happy Easter · Lễ Phục Sinh An Lành
          </span>
        </div>
      </div>
    </div>
  );
});

EasterBackground.displayName = 'EasterBackground';

export default EasterBackground;
