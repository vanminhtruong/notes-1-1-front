const Gifts = () => {
  return (
    <div className="absolute bottom-16 right-1/3 flex gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="relative animate-pulse" style={{ animationDelay: i * 0.3 + 's', animationDuration: '2s' }}>
          <div 
            className="w-8 h-8 rounded shadow-lg"
            style={{
              backgroundColor: ['#dc143c', '#ffd700', '#228b22'][i],
              transform: `rotate(${i * 15}deg)`,
            }}
          >
            {/* Ruy băng */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-white/80 transform -translate-y-1/2" />
            <div className="absolute inset-y-0 left-1/2 w-1 bg-white/80 transform -translate-x-1/2" />
            {/* Nơ */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white/80 rounded-full" />
            <div className="absolute -top-1 -left-1 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <div className="absolute -bottom-1 -right-1 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gifts;
