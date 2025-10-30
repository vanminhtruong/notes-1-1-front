const Hills = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full h-2/5 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0,28 Q25,15 50,20 T100,28 L100,100 L0,100 Z" fill="#e8f4ff" opacity="0.6" />
        <path d="M0,38 Q25,25 50,32 T100,38 L100,100 L0,100 Z" fill="#f0f8ff" opacity="0.8" />
      </svg>
    </div>
  );
};

export default Hills;
