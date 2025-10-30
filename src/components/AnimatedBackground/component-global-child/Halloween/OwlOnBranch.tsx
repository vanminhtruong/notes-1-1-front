import { memo } from 'react';

const OwlOnBranch = memo(() => (
  <div className="absolute" style={{ left: '5%', top: '35%', zIndex: 6 }}>
    <svg width="40" height="50" viewBox="0 0 40 50">
      <rect x="0" y="35" width="40" height="4" fill="#3a2a1a" rx="2" />
      <ellipse cx="20" cy="28" rx="10" ry="12" fill="#4a3a2a" />
      <circle cx="17" cy="26" r="4" fill="#f0e68c" />
      <circle cx="23" cy="26" r="4" fill="#f0e68c" />
      <circle cx="17" cy="26" r="2" fill="#000" style={{ animation: 'owlBlink 4s infinite' }} />
      <circle cx="23" cy="26" r="2" fill="#000" style={{ animation: 'owlBlink 4s infinite' }} />
      <path d="M20 28 l-2 3 l2 -1 l2 1 z" fill="#d2691e" />
      <path d="M14 20 l3 -4 l3 2" fill="#4a3a2a" />
      <path d="M26 20 l-3 -4 l-3 2" fill="#4a3a2a" />
    </svg>
  </div>
));

OwlOnBranch.displayName = 'OwlOnBranch';

export default OwlOnBranch;
