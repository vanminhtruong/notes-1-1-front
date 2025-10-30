const FogLayers = () => (
  <>
    <div className="absolute inset-x-0 top-16 h-40" style={{ zIndex: 2, overflow: 'hidden' }}>
      <div style={{ width: '160%', height: '100%', background: 'linear-gradient( to right, rgba(255,255,255,0.04), rgba(255,255,255,0.02), rgba(255,255,255,0.04))', filter: 'blur(6px)', animation: 'fogMoveSlow 60s linear infinite' }} />
    </div>
    <div className="absolute inset-x-0 top-28 h-36" style={{ zIndex: 2, overflow: 'hidden' }}>
      <div style={{ width: '180%', height: '100%', background: 'linear-gradient( to right, rgba(255,255,255,0.05), rgba(255,255,255,0.025), rgba(255,255,255,0.05))', filter: 'blur(8px)', animation: 'fogMoveFast 90s linear infinite' }} />
    </div>
  </>
);

export default FogLayers;
