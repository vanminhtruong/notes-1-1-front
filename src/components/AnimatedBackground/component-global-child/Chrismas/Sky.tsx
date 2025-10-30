import { memo } from 'react';

const Sky = memo(() => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128] via-[#1a2332] to-[#2d3e50]">
      {/* Aurora Borealis - Cực quang */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-400/20 via-blue-400/10 to-transparent animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-400/15 via-pink-400/10 to-transparent animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>
      
      {/* Sao lấp lánh */}
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: Math.random() * 60 + '%',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 3 + 's',
            animationDuration: Math.random() * 2 + 2 + 's',
            boxShadow: '0 0 2px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  );
});

Sky.displayName = 'Sky';

export default Sky;
