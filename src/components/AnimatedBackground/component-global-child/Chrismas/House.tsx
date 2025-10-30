import { memo } from 'react';

const House = memo(() => {
  return (
    <>
      {/* Nhà chính */}
      <div className="absolute bottom-20 left-1/4 transform -translate-x-1/2">
      {/* Bóng nhà */}
      <div className="absolute -bottom-2 left-0 w-full h-4 bg-black/20 blur-md rounded-full" />
      <div className="absolute -bottom-3 left-6 w-24 h-8 bg-yellow-300/15 blur-md rounded-full" />
      
      {/* Thân nhà */}
      <div className="relative w-48 h-32 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-lg shadow-2xl">
        {/* Vân gỗ */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-1 bg-[#654321] my-4" />
          ))}
        </div>
        
        {/* Mái nhà */}
        <div className="absolute -top-12 -left-4 w-56 h-16 bg-gradient-to-b from-[#dc143c] to-[#8b0000] transform -skew-y-12 origin-bottom-left shadow-xl">
          {/* Viền mái */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
          <div className="absolute -bottom-2 left-2 right-2 flex justify-between opacity-90">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-0 h-0 border-l-2 border-r-2 border-b-8 border-l-transparent border-r-transparent border-b-white/80" style={{ opacity: 0.7 - (i % 3) * 0.1 }} />
            ))}
          </div>
        </div>
        <div className="absolute -top-8 left-0 w-full h-4 bg-white rounded-t-lg shadow-lg" />
        
        {/* Ống khói với gạch */}
        <div className="absolute -top-20 right-8 w-8 h-16 bg-gradient-to-r from-[#8b4513] to-[#654321] rounded-t-lg shadow-lg">
          {/* Gạch ống khói */}
          <div className="absolute inset-0 grid grid-rows-4 gap-0.5 p-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#654321]/50 rounded-sm" />
            ))}
          </div>
          {/* Khói */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 transform -translate-x-1/2 rounded-full opacity-40 animate-ping"
              style={{
                top: -8 - i * 6 + 'px',
                width: 6 + i * 2 + 'px',
                height: 6 + i * 2 + 'px',
                backgroundColor: i % 2 === 0 ? '#d3d3d3' : '#a9a9a9',
                animationDelay: i * 0.4 + 's',
                animationDuration: '3s',
              }}
            />
          ))}
        </div>

        {/* Cửa sổ phát sáng - Cải thiện */}
        <div className="absolute top-8 left-8 w-12 h-16 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-lg shadow-[0_0_40px_15px_rgba(255,200,100,0.7)] border-2 border-[#654321]">
          <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
            <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s' }} />
            <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2s', animationDelay: '1.5s' }} />
          </div>
          {/* Khung cửa sổ */}
          <div className="absolute inset-0 border-2 border-[#654321] rounded-lg" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#654321]" />
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#654321]" />
        </div>

        {/* Cửa với chi tiết */}
        <div className="absolute bottom-0 right-8 w-10 h-20 bg-gradient-to-b from-[#654321] to-[#3e2723] rounded-t-lg border-2 border-[#3e2723]">
          {/* Vân gỗ cửa */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-0.5 bg-black my-4" />
            ))}
          </div>
          {/* Tay nắm */}
          <div className="absolute top-1/2 right-2 w-1.5 h-1.5 bg-yellow-600 rounded-full shadow-md" />
          {/* Ánh sáng từ khe cửa */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400/50 blur-sm" />
        </div>

        {/* Đèn trang trí trên mái */}
        <div className="absolute -top-8 left-0 right-0 flex justify-around">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i % 4],
                boxShadow: `0 0 8px ${['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i % 4]}`,
                animationDelay: i * 0.2 + 's',
                animationDuration: '1.5s',
              }}
            />
          ))}
          <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-black/20 rounded-full" />
        </div>
      </div>
    </div>
    </>
  );
});

House.displayName = 'House';

export default House;
