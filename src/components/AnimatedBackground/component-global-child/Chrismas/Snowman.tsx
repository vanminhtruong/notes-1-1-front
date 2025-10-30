import { memo } from 'react';

const Snowman = memo(() => {
  return (
    <div className="absolute bottom-20 left-1/2 transform translate-x-32 flex flex-col items-center">
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/25 blur-md rounded-full" />

      {/* Mũ */}
      <div className="relative z-30 mb-1">
        <div className="w-8 h-5 bg-black rounded-t-md shadow-md mx-auto" />
        <div className="w-10 h-1.5 bg-black/90 rounded-full shadow mx-auto -mt-0.5" />
        <div className="w-8 h-0.5 bg-red-600 rounded mx-auto absolute top-0.5 left-1/2 -translate-x-1/2" />
      </div>

      {/* Đầu (nhỏ nhất) */}
      <div className="relative z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-white/40">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 40% 25%, rgba(255,255,255,0.98), rgba(235,242,250,0.95) 65%, rgba(215,225,240,0.9))'
        }} />
        {/* Mắt than */}
        <div className="absolute top-2.5 left-2 w-1.5 h-1.5 bg-black rounded-full shadow" />
        <div className="absolute top-2.5 right-2 w-1.5 h-1.5 bg-black rounded-full shadow" />
        <div className="absolute top-[11px] left-[13px] w-0.5 h-0.5 bg-white/90 rounded-full" />
        <div className="absolute top-[11px] right-[13px] w-0.5 h-0.5 bg-white/90 rounded-full" />
        {/* Mũi cà rốt 3D */}
        <svg className="absolute top-4 left-1/2 -translate-x-1/2" width="12" height="10" viewBox="0 0 12 10">
          <defs>
            <linearGradient id="carrot-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffa94d" />
              <stop offset="100%" stopColor="#ff7a1a" />
            </linearGradient>
          </defs>
          <polygon points="0,5 12,0 12,10" fill="url(#carrot-grad)" />
        </svg>
        {/* Miệng cong nhẹ */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1.5 w-5 h-1.5 rounded-full" style={{ borderBottom: '2px solid #111' }} />
        {/* Highlight nhỏ */}
        <div className="absolute -right-1 top-3 w-1.5 h-1.5 rounded-full bg-white/30 blur-[1px] animate-ping" style={{ animationDuration: '2.6s' }} />
      </div>

      {/* Thân giữa (vừa) */}
      <div className="relative z-10 -mt-3 w-14 h-14 bg-white rounded-full shadow-xl border border-white/40">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.96), rgba(235,240,250,0.95) 60%, rgba(215,225,240,0.9))'
        }} />
        {/* Nút áo than bóng */}
        {[3,7,11].map((y, idx) => (
          <div key={idx} className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{
            top: y + 'px',
            background: 'radial-gradient(circle at 30% 30%, #222, #000)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.6)'
          }}>
            <div className="absolute w-0.5 h-0.5 bg-white/80 rounded-full" style={{ top: '0.2rem', left: '0.2rem' }} />
          </div>
        ))}
        {/* Khăn len có vân */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded bg-gradient-to-r from-red-700 via-red-600 to-red-700 shadow-md" />
        <div className="absolute top-0.5 left-7 w-2.5 h-7 rounded bg-gradient-to-b from-red-700 to-red-600 transform -rotate-8" />
        <div className="absolute top-0.5 left-10 w-2.5 h-8 rounded bg-gradient-to-b from-red-700 to-red-600 transform rotate-6" />
        {/* Sợi vân dệt */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute left-1/2 -translate-x-1/2 w-14 h-[1px] bg-white/20" style={{ top: 1 + i * 2.5 + 'px' }} />
        ))}
        
        {/* Tay ở thân giữa */}
        <div className="absolute top-3 -left-8 w-8 h-1.5 bg-[#5c3a22] rounded-full transform -rotate-30 shadow" />
        <div className="absolute top-[10px] -left-[38px] w-3 h-0.5 bg-[#5c3a22] rounded-full transform -rotate-25" />
        <div className="absolute top-[13px] -left-[34px] w-2.5 h-0.5 bg-[#5c3a22] rounded-full transform -rotate-5" />
        <div className="absolute top-3 -right-8 w-8 h-1.5 bg-[#5c3a22] rounded-full transform rotate-30 shadow" />
        <div className="absolute top-[10px] -right-[38px] w-3 h-0.5 bg-[#5c3a22] rounded-full transform rotate-25" />
        <div className="absolute top-[13px] -right-[34px] w-2.5 h-0.5 bg-[#5c3a22] rounded-full transform rotate-5" />
        <div className="absolute top-[8px] -left-[30px] w-3 h-0.5 bg-white/80 rounded-full opacity-80" />
        <div className="absolute top-[8px] -right-[30px] w-3 h-0.5 bg-white/80 rounded-full opacity-80" />
      </div>

      {/* Thân dưới (lớn nhất) */}
      <div className="relative z-0 -mt-4 w-20 h-20 bg-white rounded-full shadow-2xl border border-white/40">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(240,244,255,0.95) 40%, rgba(220,230,245,0.9) 70%)'
        }} />
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 -12px 18px rgba(0,0,0,0.08)' }} />
      </div>

      {/* Tia lấp lánh nhẹ quanh người tuyết */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/70 animate-pulse"
          style={{
            width: 2 + 'px',
            height: 2 + 'px',
            top: (10 + Math.random() * 30) + 'px',
            left: (5 + Math.random() * 30) + 'px',
            boxShadow: '0 0 6px rgba(255,255,255,0.9)',
            animationDelay: (i * 0.5) + 's',
            animationDuration: '2.2s',
          }}
        />
      ))}
    </div>
  );
});

Snowman.displayName = 'Snowman';

export default Snowman;
