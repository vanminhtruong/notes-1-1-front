import { memo } from 'react';

const Reindeer = memo(() => {
  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDuration: '3s' }}>
      <div className="relative w-16 h-16">
        {/* Thân */}
        <div className="absolute bottom-0 left-4 w-8 h-10 bg-gradient-to-b from-[#8b4513] to-[#654321] rounded-lg" />
        {/* Đầu */}
        <div className="absolute top-0 left-3 w-6 h-6 bg-gradient-to-b from-[#a0522d] to-[#8b4513] rounded-full">
          {/* Mắt */}
          <div className="absolute top-2 left-1 w-1 h-1 bg-black rounded-full" />
          <div className="absolute top-2 right-1 w-1 h-1 bg-black rounded-full" />
          {/* Mũi đỏ */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
          <div className="absolute -right-1 bottom-0 w-1.5 h-1.5 rounded-full bg-white/30 blur-[1px] animate-ping" style={{ animationDuration: '2.2s' }} />
        </div>
        {/* Sừng */}
        <div className="absolute -top-2 left-2 w-1 h-4 bg-[#654321] transform -rotate-45" />
        <div className="absolute -top-2 right-2 w-1 h-4 bg-[#654321] transform rotate-45" />
        {/* Chân */}
        <div className="absolute bottom-0 left-3 w-1 h-3 bg-[#654321]" />
        <div className="absolute bottom-0 left-6 w-1 h-3 bg-[#654321]" />
        <div className="absolute bottom-0 left-9 w-1 h-3 bg-[#654321]" />
        <div className="absolute bottom-0 left-12 w-1 h-3 bg-[#654321]" />
        <div className="absolute bottom-3 left-11 w-2 h-1 bg-[#654321] rounded-full" style={{ transform: 'rotate(-20deg)' }} />
      </div>
    </div>
  );
});

Reindeer.displayName = 'Reindeer';

export default Reindeer;
