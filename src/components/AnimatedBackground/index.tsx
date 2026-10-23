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
  const currentThemeRef = useRef(theme);
  // Allow background on auth pages even if appTheme is not dark-black
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  // Show when enabled; restrict to dark-black except for auth pages
  const shouldShow = enabled && (isAuthPage || appTheme === 'dark-black');

  // Keep timer ownership independent of state updates during the fade.
  useEffect(() => {
    const next = shouldShow ? theme : 'none';
    const outgoing = currentThemeRef.current;
    currentThemeRef.current = next;
    setCurrentTheme(next);
    if (next === 'none' || outgoing === 'none' || next === outgoing) {
      setPreviousTheme(null);
      setIsTransitioning(false);
      return;
    }
    setPreviousTheme(outgoing);
    setIsTransitioning(true);
    const timer = window.setTimeout(() => {
      setPreviousTheme(null);
      setIsTransitioning(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [theme, shouldShow]);

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
        data-background-theme={bgTheme}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity,
          transition: 'opacity 0.3s ease-in-out',
          zIndex,
          pointerEvents: 'none',
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
