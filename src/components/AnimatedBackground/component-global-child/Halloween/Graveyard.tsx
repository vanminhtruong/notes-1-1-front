const Graveyard = () => (
  <div className="absolute left-0 right-0" style={{ zIndex: 5, height: 160, bottom: '60px' }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 160" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1200" height="160" fill="url(#ground)" />
      <g fill="#070707">
        <path d="M0 120 C 150 90, 300 140, 450 115 C 600 90, 750 140, 900 115 C 1050 90, 1120 130, 1200 120 L 1200 160 L 0 160 Z" />
      </g>
      <g fill="#0d0d0d">
        <rect x="140" y="96" width="22" height="28" rx="4" />
        <rect x="190" y="94" width="20" height="32" rx="4" />
        <rect x="240" y="98" width="18" height="28" rx="3" />
        <rect x="300" y="90" width="18" height="34" rx="3" />
        <rect x="420" y="95" width="22" height="30" rx="4" />
        <rect x="520" y="100" width="20" height="30" rx="4" />
        <rect x="620" y="92" width="24" height="36" rx="5" />
        <rect x="720" y="96" width="18" height="30" rx="3" />
        <rect x="780" y="92" width="24" height="38" rx="5" />
        <rect x="860" y="94" width="20" height="32" rx="4" />
        <rect x="960" y="98" width="18" height="34" rx="3" />
        <rect x="1040" y="96" width="22" height="30" rx="4" />
      </g>
      <g fill="#0a0a0a">
        <rect x="148" y="102" width="6" height="14" />
        <rect x="144" y="106" width="14" height="4" />
        <rect x="306" y="96" width="6" height="14" />
        <rect x="302" y="100" width="14" height="4" />
        <rect x="788" y="98" width="8" height="16" />
        <rect x="783" y="103" width="18" height="5" />
      </g>
    </svg>
  </div>
);

export default Graveyard;
