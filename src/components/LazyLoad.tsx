import { useEffect, useRef, useState, memo, type ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  animationDuration?: number;
  delay?: number;
  reAnimate?: boolean;
}

const LazyLoad = memo(({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  animationDuration = 600,
  delay = 0,
  reAnimate = true,
}: LazyLoadProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeoutRef.current = setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else if (reAnimate) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay, reAnimate]);

  return (
    <div
      ref={elementRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
});

LazyLoad.displayName = 'LazyLoad';

export default LazyLoad;
