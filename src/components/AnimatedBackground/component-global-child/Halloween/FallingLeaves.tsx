const FallingLeaves = () => (
  <div className="absolute inset-0" style={{ zIndex: 3, overflow: 'hidden' }}>
    {[
      { left: '10%', delay: 0, duration: 8 },
      { left: '25%', delay: 2, duration: 9 },
      { left: '45%', delay: 4, duration: 7 },
      { left: '60%', delay: 1, duration: 10 },
      { left: '75%', delay: 5, duration: 8 },
      { left: '85%', delay: 3, duration: 9 },
    ].map((leaf, idx) => (
      <div key={idx} style={{ position: 'absolute', left: leaf.left, top: 0, animation: `leafFall ${leaf.duration}s linear ${leaf.delay}s infinite` }}>
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 1 Q8 4 9 6 Q8 8 6 11 Q4 8 3 6 Q4 4 6 1 Z" fill="#8B4513" opacity="0.7" />
        </svg>
      </div>
    ))}
  </div>
);

export default FallingLeaves;
