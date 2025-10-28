const DistantHouses = () => {
  return (
    <>
      <div className="absolute bottom-40 left-[15%] transform -translate-x-1/2 scale-[0.35]">
        <div className="relative w-48 h-32 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-lg shadow-xl">
          <div className="absolute -bottom-2 left-2 w-24 h-6 bg-black/20 blur-md rounded-full" />
          <div className="absolute -top-12 -left-4 w-56 h-16 bg-gradient-to-b from-[#dc143c] to-[#8b0000] transform -skew-y-12 origin-bottom-left shadow-lg" />
          <div className="absolute -top-8 left-0 w-full h-4 bg-white rounded-t-lg shadow-md" />
          <div className="absolute -top-20 right-8 w-8 h-16 bg-gradient-to-r from-[#8b4513] to-[#654321] rounded-t-lg shadow-md">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 transform -translate-x-1/2 rounded-full opacity-50 animate-ping"
                style={{
                  top: -8 - i * 6 + 'px',
                  width: 6 + i * 2 + 'px',
                  height: 6 + i * 2 + 'px',
                  backgroundColor: i % 2 === 0 ? '#d3d3d3' : '#a9a9a9',
                  animationDelay: i * 0.5 + 's',
                  animationDuration: '3.5s',
                }}
              />
            ))}
          </div>
          <div className="absolute top-8 left-8 w-12 h-16 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-lg shadow-[0_0_30px_10px_rgba(255,200,100,0.6)] border-2 border-[#654321]">
            <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
              <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2.5s' }} />
              <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }} />
              <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1.2s' }} />
              <div className="bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1.8s' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-40 right-[25%] transform translate-x-1/2 scale-[0.3]">
        <div className="relative w-48 h-32 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-lg shadow-xl">
          <div className="absolute -bottom-2 left-2 w-24 h-6 bg-black/20 blur-md rounded-full" />
          <div className="absolute -top-12 -left-4 w-56 h-16 bg-gradient-to-b from-[#8b0000] to-[#dc143c] transform -skew-y-12 origin-bottom-left shadow-lg" />
          <div className="absolute -top-8 left-0 w-full h-4 bg-white rounded-t-lg shadow-md" />
          <div className="absolute -top-20 right-10 w-8 h-16 bg-gradient-to-r from-[#8b4513] to-[#654321] rounded-t-lg shadow-md">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 transform -translate-x-1/2 rounded-full opacity-50 animate-ping"
                style={{
                  top: -8 - i * 6 + 'px',
                  width: 6 + i * 2 + 'px',
                  height: 6 + i * 2 + 'px',
                  backgroundColor: i % 2 === 0 ? '#d3d3d3' : '#a9a9a9',
                  animationDelay: i * 0.6 + 's',
                  animationDuration: '4s',
                }}
              />
            ))}
          </div>
          <div className="absolute top-10 left-10 w-10 h-14 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-lg shadow-[0_0_25px_8px_rgba(255,200,100,0.5)] border-2 border-[#654321]">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-32 right-[12%] transform translate-x-1/2 scale-[0.28]">
        <div className="relative w-48 h-32 bg-gradient-to-br from-[#8b4513] to-[#654321] rounded-lg shadow-xl">
          <div className="absolute -bottom-2 left-2 w-24 h-6 bg-black/20 blur-md rounded-full" />
          <div className="absolute -top-12 -left-4 w-56 h-16 bg-gradient-to-b from-[#dc143c] to-[#8b0000] transform -skew-y-12 origin-bottom-left shadow-lg" />
          <div className="absolute -top-8 left-0 w-full h-4 bg-white rounded-t-lg shadow-md" />
          <div className="absolute -top-20 right-12 w-8 h-16 bg-gradient-to-r from-[#8b4513] to-[#654321] rounded-t-lg shadow-md">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 transform -translate-x-1/2 rounded-full opacity-45 animate-ping"
                style={{
                  top: -8 - i * 7 + 'px',
                  width: 6 + i * 2 + 'px',
                  height: 6 + i * 2 + 'px',
                  backgroundColor: i % 2 === 0 ? '#d3d3d3' : '#a9a9a9',
                  animationDelay: i * 0.7 + 's',
                  animationDuration: '4.5s',
                }}
              />
            ))}
          </div>
          <div className="absolute top-12 left-12 w-8 h-12 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-lg shadow-[0_0_20px_6px_rgba(255,200,100,0.4)] border-2 border-[#654321]">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 opacity-90 rounded animate-pulse" style={{ animationDuration: '3.5s' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DistantHouses;
