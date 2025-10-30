const BlackCatWalking = () => (
  <div className="absolute" style={{ bottom: '120px', right: '10%', zIndex: 7, animation: 'catWalk 8s linear infinite' }}>
    <svg width="50" height="30" viewBox="0 0 50 30">
      <ellipse cx="25" cy="18" rx="12" ry="8" fill="#0a0a0a" />
      <circle cx="18" cy="14" r="6" fill="#0a0a0a" />
      <path d="M12 8 l3 -6 l2 6" fill="#0a0a0a" />
      <path d="M20 8 l2 -7 l3 7" fill="#0a0a0a" />
      <circle cx="16" cy="13" r="1.5" fill="#00ff00" style={{ animation: 'eyeGlow 3s infinite' }} />
      <circle cx="20" cy="13" r="1.5" fill="#00ff00" style={{ animation: 'eyeGlow 3s infinite' }} />
      <path d="M35 20 q8 2 12 0" stroke="#0a0a0a" strokeWidth="2" fill="none" />
      <rect x="20" y="22" width="2" height="6" fill="#0a0a0a" />
      <rect x="28" y="22" width="2" height="6" fill="#0a0a0a" />
    </svg>
  </div>
);

export default BlackCatWalking;
