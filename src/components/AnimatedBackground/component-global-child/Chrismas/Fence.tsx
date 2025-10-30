import { memo } from 'react';

const Fence = memo(() => {
  return (
    <div className="absolute bottom-16 left-0 right-0 flex justify-around px-8">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="w-2 h-12 bg-gradient-to-b from-[#654321] to-[#3e2723] rounded-sm relative">
          {/* Tuyết phủ trên hàng rào */}
          <div className="absolute -top-1 left-0 right-0 h-2 bg-white rounded-full shadow-sm" />
        </div>
      ))}
      <div className="absolute left-8 right-8 top-2 h-1 bg-gradient-to-r from-[#5c3a22] to-[#3e2723] rounded" />
      <div className="absolute left-8 right-8 top-6 h-1 bg-gradient-to-r from-[#5c3a22] to-[#3e2723] rounded" />
    </div>
  );
});

Fence.displayName = 'Fence';

export default Fence;
