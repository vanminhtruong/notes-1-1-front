let preloaded = false;

export function preloadAnimatedBackgrounds() {
  if (preloaded) return;
  preloaded = true;
  // Prefetch chunks to remove first-switch delay
  import(/* webpackPrefetch: true */ '../components/AnimatedBackground/ChristmasBackground');
  import(/* webpackPrefetch: true */ '../components/AnimatedBackground/TetBackground');
  import(/* webpackPrefetch: true */ '../components/AnimatedBackground/EasterBackground');
  import(/* webpackPrefetch: true */ '../components/AnimatedBackground/HalloweenBackground');
}


