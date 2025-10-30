import { memo } from 'react';

const NightSkyGradient = memo(() => (
  <div
    className="absolute inset-0"
    style={{
      background:
        'radial-gradient(60% 50% at 70% 15%, rgba(255,140,0,0.12) 0%, rgba(255,140,0,0.06) 25%, rgba(0,0,0,0) 60%), linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
      zIndex: 0,
    }}
  />
));

NightSkyGradient.displayName = 'NightSkyGradient';

export default NightSkyGradient;
