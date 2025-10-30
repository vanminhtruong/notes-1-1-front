import { lazy, Suspense } from 'react';
import { useAnimatedBackground } from '@/hooks/useAnimatedBackground';

const ChristmasBackground = lazy(() => import('./ChristmasBackground'));
const TetBackground = lazy(() => import('./TetBackground'));
const EasterBackground = lazy(() => import('./EasterBackground'));
const HalloweenBackground = lazy(() => import('./HalloweenBackground'));

const AnimatedBackground = () => {
  const { enabled, theme } = useAnimatedBackground();

  if (!enabled || theme === 'none') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {theme === 'christmas' && <ChristmasBackground />}
      {theme === 'tet' && <TetBackground />}
      {theme === 'easter' && <EasterBackground />}
      {theme === 'halloween' && <HalloweenBackground />}
    </Suspense>
  );
};

export default AnimatedBackground;
