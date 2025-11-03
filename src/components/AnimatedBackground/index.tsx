import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { useAnimatedBackground } from '@/hooks/useAnimatedBackground';
import type { AnimatedBackgroundTheme } from '@/hooks/useAnimatedBackground';

const ChristmasBackground = lazy(() => import('./ChristmasBackground'));
const TetBackground = lazy(() => import('./TetBackground'));
const EasterBackground = lazy(() => import('./EasterBackground'));
const HalloweenBackground = lazy(() => import('./HalloweenBackground'));

const AnimatedBackground = () => {
  const { enabled, theme, appTheme } = useAnimatedBackground();
  const [currentTheme, setCurrentTheme] = useState<AnimatedBackgroundTheme>(theme);
  const [previousTheme, setPreviousTheme] = useState<AnimatedBackgroundTheme | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const preloadedRef = useRef(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Allow background on auth pages even if appTheme is not dark-black
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  // Show when enabled; restrict to dark-black except for auth pages
  const shouldShow = enabled && (isAuthPage || appTheme === 'dark-black');

  // Debug logging
  useEffect(() => {
    console.log('[AnimatedBackground Component] enabled:', enabled, 'theme:', theme, 'currentTheme:', currentTheme, 'appTheme:', appTheme, 'isAuthPage:', isAuthPage, 'shouldShow:', shouldShow);
  }, [enabled, theme, currentTheme, appTheme, isAuthPage, shouldShow]);

  // Preload all backgrounds when enabled
  useEffect(() => {
    if (enabled && !preloadedRef.current) {
      preloadedRef.current = true;
      // Preload all backgrounds immediately
      Promise.all([
        import('./ChristmasBackground'),
        import('./TetBackground'),
        import('./EasterBackground'),
        import('./HalloweenBackground'),
      ]).catch(console.error);
    }
  }, [enabled]);

  // Cross-fade transition when theme changes
  useEffect(() => {
    if (theme !== currentTheme) {
      console.log('[AnimatedBackground] Theme changing from', currentTheme, 'to', theme);
      // Clear any existing timer
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      if (theme === 'none') {
        setCurrentTheme('none');
        setPreviousTheme(null);
        setIsTransitioning(false);
        return;
      }

      // Start transition
      setIsTransitioning(true);
      setPreviousTheme(currentTheme);
      
      // Update immediately for instant visual feedback
      setCurrentTheme(theme);
      
      // Clean up previous theme after transition
      transitionTimerRef.current = setTimeout(() => {
        setPreviousTheme(null);
        setIsTransitioning(false);
      }, 300);
    }

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [theme, currentTheme]);

  // Reset when enabled changes
  useEffect(() => {
    if (!enabled) {
      setCurrentTheme('none');
      setPreviousTheme(null);
      setIsTransitioning(false);
    } else if (theme !== 'none' && currentTheme === 'none') {
      setCurrentTheme(theme);
    }
  }, [enabled, theme, currentTheme]);

  if (!shouldShow || theme === 'none') {
    return null;
  }

  const renderBackground = (bgTheme: AnimatedBackgroundTheme, isOld: boolean = false) => {
    const opacity = isOld ? (isTransitioning ? 0 : 1) : (isTransitioning ? 1 : 1);
    const zIndex = isOld ? 1 : 2;

    return (
      <div
        key={bgTheme}
        className="animated-background-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity,
          transition: 'opacity 0.3s ease-in-out',
          zIndex,
          pointerEvents: isOld ? 'none' : 'auto',
        }}
      >
        <Suspense fallback={null}>
          {bgTheme === 'christmas' && <ChristmasBackground />}
          {bgTheme === 'tet' && <TetBackground />}
          {bgTheme === 'easter' && <EasterBackground />}
          {bgTheme === 'halloween' && <HalloweenBackground />}
        </Suspense>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {previousTheme && previousTheme !== 'none' && renderBackground(previousTheme, true)}
      {currentTheme !== 'none' && renderBackground(currentTheme, false)}
    </div>
  );
};

export default AnimatedBackground;
