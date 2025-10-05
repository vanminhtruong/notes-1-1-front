import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  animationDuration?: number;
  delay?: number;
  reAnimate?: boolean; // Cho phép animate lại mỗi lần vào viewport
}

const LazyLoad = ({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  animationDuration = 600,
  delay = 0,
  reAnimate = true, // Mặc định là true để animate lại
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
            // Delay trước khi hiển thị để tạo hiệu ứng stagger
            timeoutRef.current = setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else if (reAnimate) {
            // Khi cuộn ra khỏi viewport và reAnimate = true, ẩn lại
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
      className={`lazy-load-wrapper ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};

export default LazyLoad;
