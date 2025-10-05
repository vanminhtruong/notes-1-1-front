import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  animationDuration?: number;
  delay?: number;
  reAnimate?: boolean;
}

const LazyLoad = ({
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
        transition: `opacity ${animationDuration}ms ease-out`,
        willChange: isVisible ? 'auto' : 'opacity',
      }}
    >
      {children}
    </div>
  );
};

export default LazyLoad;
