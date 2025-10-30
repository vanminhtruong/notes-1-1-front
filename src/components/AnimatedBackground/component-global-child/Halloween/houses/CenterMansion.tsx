const CenterMansion = () => (
  <g>
    <rect x="220" y="60" width="140" height="160" fill="url(#houseGrad)" />
    <rect x="270" y="20" width="40" height="100" fill="#0a0a0a" />
    <path d="M270 20 L290 5 L310 20 Z" fill="url(#roofTiles)" />
    <rect x="282" y="10" width="16" height="6" fill="#0a0a0a" />
    <rect x="210" y="70" width="25" height="50" fill="#0b0b0b" />
    <path d="M210 70 L222.5 55 L235 70 Z" fill="url(#roofTiles)" />
    <rect x="345" y="70" width="25" height="50" fill="#0b0b0b" />
    <path d="M345 70 L357.5 55 L370 70 Z" fill="url(#roofTiles)" />
    <path d="M210 60 L290 30 L370 60 Z" fill="url(#roofTiles)" />
    <rect x="240" y="25" width="10" height="20" fill="#0d0d0d" />
    <rect x="238" y="25" width="14" height="3" fill="#0f0f0f" />
    <rect x="330" y="25" width="10" height="20" fill="#0d0d0d" />
    <rect x="328" y="25" width="14" height="3" fill="#0f0f0f" />
    <g>
      <rect x="230" y="140" width="20" height="28" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="240" y1="140" x2="240" y2="168" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="230" y1="154" x2="250" y2="154" stroke="#0a0a0a" strokeWidth="1.5" />
      <rect x="232" y="142" width="7" height="10" fill="#ffb300" opacity="0.9" />
      
      <rect x="270" y="140" width="20" height="28" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="280" y1="140" x2="280" y2="168" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="270" y1="154" x2="290" y2="154" stroke="#0a0a0a" strokeWidth="1.5" />
      <rect x="272" y="142" width="7" height="10" fill="#ff8800" opacity="0.8" />
      
      <rect x="310" y="140" width="20" height="28" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="320" y1="140" x2="320" y2="168" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="310" y1="154" x2="330" y2="154" stroke="#0a0a0a" strokeWidth="1.5" />
      <rect x="312" y="142" width="7" height="10" fill="#ffb300" opacity="0.9" />
      
      <rect x="230" y="95" width="20" height="28" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="240" y1="95" x2="240" y2="123" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="230" y1="109" x2="250" y2="109" stroke="#0a0a0a" strokeWidth="1.5" />
      
      <rect x="310" y="95" width="20" height="28" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="320" y1="95" x2="320" y2="123" stroke="#0a0a0a" strokeWidth="1.5" />
      <line x1="310" y1="109" x2="330" y2="109" stroke="#0a0a0a" strokeWidth="1.5" />
      <rect x="312" y="97" width="7" height="10" fill="#ff8800" opacity="0.7" />
      
      <rect x="278" y="40" width="14" height="20" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1" />
      <path d="M285 40 Q285 52 278 60 Q292 60 292 52 Q292 40 285 40" fill="#ff6600" opacity="0.7" />
      
      <rect x="278" y="70" width="14" height="20" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1" />
      <line x1="285" y1="70" x2="285" y2="90" stroke="#0a0a0a" strokeWidth="1" />
      <line x1="278" y1="80" x2="292" y2="80" stroke="#0a0a0a" strokeWidth="1" />
    </g>
    <rect x="275" y="180" width="30" height="40" rx="15" fill="#0a0a0a" stroke="#0d0d0d" strokeWidth="2" />
    <circle cx="298" cy="200" r="2" fill="#8B7355" />
    <rect x="280" y="185" width="20" height="25" rx="10" fill="#1a1a1a" />
    <line x1="280" y1="195" x2="300" y2="195" stroke="#0a0a0a" strokeWidth="1" />
    <rect x="260" y="130" width="60" height="3" fill="#0f0f0f" />
    <g fill="#0d0d0d">
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={262 + i * 5} y="130" width="2" height="8" />
      ))}
    </g>
    <rect x="220" y="125" width="140" height="3" fill="#0f0f0f" />
    <rect x="220" y="175" width="140" height="3" fill="#0f0f0f" />
  </g>
);

export default CenterMansion;
