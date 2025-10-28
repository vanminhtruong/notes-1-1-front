const Moon = () => {
  return (
    <div className="absolute top-10 right-20">
      <div className="w-24 h-24 rounded-full bg-gradient-radial from-yellow-100 via-yellow-50 to-transparent shadow-[0_0_80px_30px_rgba(255,255,200,0.6)]" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-yellow-50" />
      <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-black/25 via-transparent to-transparent opacity-70" />
      <div className="absolute -inset-6 rounded-full" style={{ boxShadow: '0 0 120px 30px rgba(255, 255, 210, 0.15)' }} />
      <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-yellow-200/40" />
      <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-yellow-200/30" />
      <div className="absolute bottom-6 left-8 w-2 h-2 rounded-full bg-yellow-200/30" />
      <div className="absolute bottom-5 right-8 w-2.5 h-2.5 rounded-full bg-yellow-200/40" />
    </div>
  );
};

export default Moon;
