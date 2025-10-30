import { memo } from 'react';

const WitchFlying = memo(() => (
  <div className="absolute" style={{ top: '10%', zIndex: 5, animation: 'witchFly 25s linear infinite' }}>
    <svg width="80" height="60" viewBox="0 0 80 60">
      <line x1="10" y1="35" x2="70" y2="35" stroke="#5a3a1a" strokeWidth="2" />
      <path d="M70 30 l8 5 l-8 5 l6 3 l-6 2 l5 2 l-5 3" stroke="#8B7355" strokeWidth="1" fill="none" />
      <ellipse cx="35" cy="30" rx="8" ry="10" fill="#1a1a1a" />
      <circle cx="35" cy="25" r="5" fill="#d4a574" />
      <path d="M30 20 l5 -8 l10 0 l-3 8 z" fill="#1a1a1a" />
      <circle cx="33" cy="24" r="1" fill="#fff" />
      <circle cx="37" cy="24" r="1" fill="#fff" />
      <path d="M35 27 q2 2 4 0" stroke="#8B4513" strokeWidth="0.5" fill="none" />
    </svg>
  </div>
));

WitchFlying.displayName = 'WitchFlying';

export default WitchFlying;
