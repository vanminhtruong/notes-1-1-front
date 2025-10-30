import { memo } from 'react';

const Trees = memo(() => {
  return (
    <>
      {/* Rừng cây phía xa - Lớp 1 (xa nhất, nhỏ nhất) - Tăng số lượng và chiều cao */}
      <div className="absolute bottom-48 left-0 right-0 opacity-35">
        <div className="flex items-end justify-around -mx-2">
          {[...Array(35)].map((_, i) => (
            <div
              key={`far-${i}`}
              className="relative -mx-1"
              style={{
                height: (60 + Math.random() * 50) + 'px',
                transform: `scale(${0.7 + (i % 4) * 0.08})`,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                alignSelf: 'flex-end',
              }}
            >
              <svg viewBox="0 0 60 140" className="w-7 h-full">
                <defs>
                  <linearGradient id={`tree-far-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b5e20" />
                    <stop offset="100%" stopColor="#0a2f0a" />
                  </linearGradient>
                </defs>
                <polygon points="30,2 2,50 58,50" fill={`url(#tree-far-${i})`} />
                <polygon points="30,25 4,75 56,75" fill={`url(#tree-far-${i})`} />
                <polygon points="30,50 6,100 54,100" fill={`url(#tree-far-${i})`} />
                <polygon points="30,75 10,125 50,125" fill={`url(#tree-far-${i})`} />
                <rect x="26" y="120" width="8" height="18" fill="#4a2f1a" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Rừng cây phía xa - Lớp 2 (gần hơn, to hơn) - Tăng số lượng và chiều cao */}
      <div className="absolute bottom-40 left-0 right-0 opacity-45">
        <div className="flex items-end justify-around px-2 -mx-1">
          {[...Array(28)].map((_, i) => (
            <div
              key={`mid-far-${i}`}
              className="relative -mx-1"
              style={{
                height: (80 + Math.random() * 60) + 'px',
                transform: `scale(${0.8 + (i % 4) * 0.08})`,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.18))',
                alignSelf: 'flex-end',
              }}
            >
              <svg viewBox="0 0 60 140" className="w-8 h-full">
                <defs>
                  <linearGradient id={`tree-mid-far-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b5e20" />
                    <stop offset="100%" stopColor="#0c3d0c" />
                  </linearGradient>
                </defs>
                <polygon points="30,2 2,50 58,50" fill={`url(#tree-mid-far-${i})`} />
                <polygon points="30,25 4,75 56,75" fill={`url(#tree-mid-far-${i})`} />
                <polygon points="30,50 6,100 54,100" fill={`url(#tree-mid-far-${i})`} />
                <polygon points="30,75 10,125 50,125" fill={`url(#tree-mid-far-${i})`} />
                <rect x="26" y="120" width="8" height="18" fill="#5c3a22" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Rừng cây phía xa - Lớp 3 (gần hơn nữa) - Tăng số lượng và chiều cao */}
      <div className="absolute bottom-32 left-0 right-0 opacity-55">
        <div className="flex items-end justify-around px-3 -mx-1">
          {[...Array(22)].map((_, i) => (
            <div
              key={`mid-${i}`}
              className="relative -mx-0.5"
              style={{
                height: (100 + Math.random() * 70) + 'px',
                transform: `scale(${0.9 + (i % 4) * 0.08})`,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
                alignSelf: 'flex-end',
              }}
            >
              <svg viewBox="0 0 60 140" className="w-9 h-full">
                <defs>
                  <linearGradient id={`tree-mid-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b5e20" />
                    <stop offset="100%" stopColor="#0c3d0c" />
                  </linearGradient>
                </defs>
                <polygon points="30,2 2,50 58,50" fill={`url(#tree-mid-${i})`} />
                <path d="M30 8 C27 14, 22 24, 20 28 L40 28 C38 24, 33 14, 30 8" fill="rgba(255,255,255,0.9)" opacity="0.6" />
                <polygon points="30,25 4,75 56,75" fill={`url(#tree-mid-${i})`} />
                <polygon points="30,50 6,100 54,100" fill={`url(#tree-mid-${i})`} />
                <polygon points="30,75 10,125 50,125" fill={`url(#tree-mid-${i})`} />
                <rect x="26" y="120" width="8" height="18" fill="#5c3a22" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Rừng cây phía xa - Lớp 4 (gần nhất, chi tiết nhất) - Tăng số lượng và chiều cao */}
      <div className="absolute bottom-24 left-0 right-0 opacity-70">
        <div className="flex items-end justify-around px-6 -mx-0.5">
          {[...Array(18)].map((_, i) => (
            <div
              key={`near-${i}`}
              className="relative"
              style={{
                height: (120 + Math.random() * 80) + 'px',
                transform: `scale(${1 + (i % 4) * 0.1})`,
                filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))',
                alignSelf: 'flex-end',
              }}
            >
              <svg viewBox="0 0 60 140" className="w-11 h-full">
                <defs>
                  <linearGradient id={`tree-near-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b5e20" />
                    <stop offset="100%" stopColor="#0c3d0c" />
                  </linearGradient>
                </defs>
                <polygon points="30,2 2,50 58,50" fill={`url(#tree-near-${i})`} />
                <path d="M30 8 C27 14, 22 24, 20 28 C18 32, 16 36, 14 40 L46 40 C44 36, 42 32, 40 28 C38 24, 33 14, 30 8" fill="rgba(255,255,255,0.9)" opacity="0.7" />
                <polygon points="30,25 4,75 56,75" fill={`url(#tree-near-${i})`} />
                <path d="M30 32 C27 38, 24 46, 22 52 L38 52 C36 46, 33 38, 30 32" fill="rgba(255,255,255,0.9)" opacity="0.65" />
                <polygon points="30,50 6,100 54,100" fill={`url(#tree-near-${i})`} />
                <path d="M30 58 C28 64, 26 72, 24 78 L36 78 C34 72, 32 64, 30 58" fill="rgba(255,255,255,0.9)" opacity="0.6" />
                <polygon points="30,75 10,125 50,125" fill={`url(#tree-near-${i})`} />
                <path d="M30 84 C28 90, 26 98, 25 104 L35 104 C34 98, 32 90, 30 84" fill="rgba(255,255,255,0.9)" opacity="0.55" />
                <rect x="26" y="120" width="8" height="18" fill="#5c3a22" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

Trees.displayName = 'Trees';

export default Trees;
