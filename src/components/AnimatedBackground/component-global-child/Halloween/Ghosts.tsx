import { memo } from 'react';

const Ghosts = memo(() => (
  <div className="absolute inset-0" style={{ zIndex: 6 }}>
    {[
      { left: '18%', top: '28%', scale: 0.9, delay: 0 },
      { left: '42%', top: '22%', scale: 0.8, delay: 0.6 },
      { left: '68%', top: '26%', scale: 1.0, delay: 1.1 },
      { left: '12%', top: '35%', scale: 0.7, delay: 1.8 },
      { left: '55%', top: '32%', scale: 0.85, delay: 2.4 },
      { left: '82%', top: '30%', scale: 0.9, delay: 0.9 },
    ].map((g, idx) => (
      <div key={idx} className="absolute" style={{ left: g.left, top: g.top, transform: `scale(${g.scale})`, animation: `ghostFloat 6s ease-in-out ${g.delay}s infinite` }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <path d="M30 8 C 40 8, 48 16, 48 28 L 48 50 C 44 48, 42 52, 38 50 C 34 48, 32 52, 28 50 C 24 48, 22 52, 18 50 C 14 48, 12 52, 8 50 L 8 28 C 8 16, 16 8, 30 8 Z" fill="rgba(255,255,255,0.85)" />
          <circle cx="24" cy="26" r="3" fill="#222" />
          <circle cx="36" cy="26" r="3" fill="#222" />
          <ellipse cx="30" cy="36" rx="6" ry="4" fill="#333" opacity="0.35" />
        </svg>
      </div>
    ))}
  </div>
));

Ghosts.displayName = 'Ghosts';

export default Ghosts;
