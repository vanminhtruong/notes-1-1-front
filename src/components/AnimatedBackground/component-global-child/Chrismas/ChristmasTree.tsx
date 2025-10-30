import { memo } from 'react';

const ChristmasTree = memo(() => {
  return (
    <div className="absolute bottom-16 right-1/4 transform translate-x-1/2 scale-150">
      {/* Thân cây */}
      <div className="relative flex flex-col items-center">
        {/* Ngôi sao trên đỉnh */}
        <div className="w-12 h-12 mb-3 animate-pulse">
          <svg viewBox="0 0 24 24" fill="#ffd700" className="drop-shadow-[0_0_15px_rgba(255,215,0,0.9)]">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        {/* Các tầng lá */}
        {[0, 1, 2, 3, 4, 5, 6].map((layer) => (
          <div
            key={layer}
            className="relative"
            style={{
              width: 100 + layer * 28 + 'px',
              height: '40px',
              marginTop: layer === 0 ? '0' : '-12px',
            }}
          >
            <svg viewBox="0 0 100 30" className="w-full h-full">
              <polygon
                points="50,0 0,30 100,30"
                fill="#0d5c0d"
                className="drop-shadow-lg"
              />
            </svg>
            
            {/* Đèn trang trí */}
            {[...Array(layer + 2)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: ['#ff0000', '#ffd700', '#00ff00', '#0000ff'][i % 4],
                  top: Math.random() * 20 + 'px',
                  left: (i / (layer + 2)) * 100 + '%',
                  boxShadow: `0 0 10px ${['#ff0000', '#ffd700', '#00ff00', '#0000ff'][i % 4]}`,
                  animationDelay: i * 0.3 + 's',
                  animationDuration: '1.5s',
                }}
              />
            ))}
            <div className="absolute left-[5%] right-[5%] top-[18px] h-0.5 bg-gradient-to-r from-amber-300/70 via-amber-200/40 to-amber-300/70 rounded-full opacity-80" />
            {[...Array(Math.max(1, layer))].map((_, j) => (
              <div
                key={`orn-${layer}-${j}`}
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                  background: ['linear-gradient(135deg, #ffd1d1, #ff6b6b)','linear-gradient(135deg, #fff4c1, #ffd54f)','linear-gradient(135deg, #c8f7dc, #66bb6a)','linear-gradient(135deg, #cfe8ff, #42a5f5)'][j % 4],
                  top: 6 + Math.random() * 18 + 'px',
                  left: (j / Math.max(1, layer)) * 100 + '%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                }}
              >
                <div className="absolute w-1 h-1 bg-white/85 rounded-full" style={{ top: '2px', left: '2px' }} />
              </div>
            ))}
          </div>
        ))}

        {/* Thân cây */}
        <div className="w-10 h-14 bg-gradient-to-b from-[#654321] to-[#3e2723] rounded-b-lg shadow-lg" />
      </div>
    </div>
  );
});

ChristmasTree.displayName = 'ChristmasTree';

export default ChristmasTree;
