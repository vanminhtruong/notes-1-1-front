import { memo } from 'react';

const LightningFlash = memo(() => (
  <div className="absolute inset-0" style={{ zIndex: 2, background: 'rgba(200,220,255,0.3)', animation: 'lightning 8s infinite', pointerEvents: 'none' }} />
));

LightningFlash.displayName = 'LightningFlash';

export default LightningFlash;
