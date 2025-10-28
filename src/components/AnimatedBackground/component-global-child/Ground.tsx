const Ground = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full h-24 bg-gradient-to-t from-white via-[#f0f8ff] to-transparent overflow-hidden">
      {/* Gợn sóng tuyết */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="snow-shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M0,50 Q12.5,30 25,50 T50,50 T75,50 T100,50 L100,100 L0,100 Z" fill="white" filter="url(#snow-shadow)" />
        <path d="M0,60 Q16.67,50 33.33,60 T66.67,60 T100,60 L100,100 L0,100 Z" fill="#fafafa" opacity="0.8" />
      </svg>
      
      {/* Dấu chân trên tuyết */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-4 bg-gray-300/30 rounded-full"
          style={{
            bottom: 20 + i * 8 + 'px',
            left: 30 + i * 15 + '%',
            transform: `rotate(${i % 2 === 0 ? '15deg' : '-15deg'})`,
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/70 animate-pulse"
          style={{
            bottom: 4 + Math.random() * 18 + 'px',
            left: Math.random() * 100 + '%',
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            animationDelay: i * 0.2 + 's',
            animationDuration: '2s',
          }}
        />
      ))}
    </div>
  );
};

export default Ground;
