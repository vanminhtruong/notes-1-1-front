const MoonAndClouds = () => (
  <div className="absolute inset-0" style={{ zIndex: 1 }}>
    <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="none">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7e6" />
          <stop offset="60%" stopColor="#fff7e6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff7e6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="950" cy="110" r="46" fill="#fff7e6" />
      <circle cx="950" cy="110" r="120" fill="url(#moonGlow)" />
      <g fill="#111" opacity="0.5">
        <ellipse cx="820" cy="140" rx="120" ry="28" />
        <ellipse cx="880" cy="150" rx="140" ry="30" />
        <ellipse cx="980" cy="140" rx="120" ry="28" />
      </g>
    </svg>
  </div>
);

export default MoonAndClouds;
