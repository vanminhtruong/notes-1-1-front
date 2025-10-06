import { useEffect, useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

interface BackToTopProps {
  threshold?: number; // px scrolled before showing
  bottomOffset?: string; // e.g., '1rem'
  rightOffset?: string; // e.g., '1rem'
  hideWhenChatOpen?: boolean; // hide when chat sidebar is open
}

const BackToTop = ({ threshold = 300, bottomOffset = '1rem', rightOffset = '1rem', hideWhenChatOpen = false }: BackToTopProps) => {
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    setVisible(scrolled > threshold);
  }, [threshold]);

  useEffect(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Hide button if chat is open or if not scrolled enough
  const shouldShow = visible && !hideWhenChatOpen;

  return (
    <div
      style={{ position: 'fixed', bottom: bottomOffset, right: rightOffset, zIndex: 50 }}
      aria-hidden={!shouldShow}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className={`group inline-flex items-center justify-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all
          ${shouldShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}
          bg-blue-600 text-white hover:bg-blue-700
          dark:bg-blue-600 dark:hover:bg-blue-700
        `}
        style={{ width: '40px', height: '40px' }}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
     >
        <ChevronUp className="w-5 h-5" />
        <span className="sr-only">Back to top</span>
      </button>
    </div>
  );
};

export default BackToTop;
