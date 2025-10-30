import { memo } from 'react';

const FenceLayer = memo(() => (
  <div className="absolute left-0 right-0" style={{ zIndex: 8, height: 220, bottom: '80px' }}>
    <svg width="100%" height="100%" viewBox="0 0 1400 220" preserveAspectRatio="none">
      <g fill="#0a0a0a" stroke="#0d0d0d" strokeWidth="0.5">
        <rect x="0" y="205" width="1400" height="4" />
        <rect x="0" y="215" width="1400" height="2" />
        {Array.from({ length: 105 }).map((_, i) => (
          <g key={i}>
            <rect x={2 + i * 13} y="195" width="3" height="20" />
            <path d={`M${3.5 + i * 13} 195 L${3.5 + i * 13} 190 L${0.5 + i * 13} 193 L${6.5 + i * 13} 193 Z`} />
          </g>
        ))}
      </g>
    </svg>
  </div>
));

FenceLayer.displayName = 'FenceLayer';

export default FenceLayer;
