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
  
  // Only show background when dark-black theme is active
  const shouldShow = enabled && appTheme === 'dark-black';

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
    if (theme !== currentTheme && theme !== 'none') {
      // Clear any existing timer
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      // Start transition
      setIsTransitioning(true);
      setPreviousTheme(currentTheme);
      
      // Wait for new component to mount, then fade
      transitionTimerRef.current = setTimeout(() => {
        setCurrentTheme(theme);
        
        // Clean up previous theme after transition
        transitionTimerRef.current = setTimeout(() => {
          setPreviousTheme(null);
          setIsTransitioning(false);
        }, 300);
      }, 50);
    } else if (theme === 'none') {
      setCurrentTheme('none');
      setPreviousTheme(null);
      setIsTransitioning(false);
    }

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [theme, currentTheme]);

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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {previousTheme && previousTheme !== 'none' && renderBackground(previousTheme, true)}
      {currentTheme !== 'none' && renderBackground(currentTheme, false)}
    </div>
  );
};

export default AnimatedBackground;
