import React, { useEffect, useState } from 'react';

const HeaderScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calcProgress = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
      const clientHeight = window.innerHeight || doc.clientHeight || 0;
      const scrollHeight = doc.scrollHeight || document.body.scrollHeight || 0;
      const total = Math.max(0, scrollHeight - clientHeight);
      const pct = total > 0 ? (scrollTop / total) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };

    calcProgress();
    window.addEventListener('scroll', calcProgress, { passive: true });
    window.addEventListener('resize', calcProgress);
    return () => {
      window.removeEventListener('scroll', calcProgress);
      window.removeEventListener('resize', calcProgress);
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 h-[3px] w-full bg-transparent pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default HeaderScrollProgress;
