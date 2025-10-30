let preloaded = false;
let preloadPromise: Promise<void> | null = null;

export function preloadAnimatedBackgrounds() {
  if (preloaded) return preloadPromise;
  if (preloadPromise) return preloadPromise;
  
  preloaded = true;
  // Prefetch chunks to remove first-switch delay
  preloadPromise = Promise.all([
    import(/* webpackPrefetch: true */ '../components/AnimatedBackground/ChristmasBackground'),
    import(/* webpackPrefetch: true */ '../components/AnimatedBackground/TetBackground'),
    import(/* webpackPrefetch: true */ '../components/AnimatedBackground/EasterBackground'),
    import(/* webpackPrefetch: true */ '../components/AnimatedBackground/HalloweenBackground'),
  ]).then(() => {
    console.log('[Preload] All animated backgrounds loaded');
  }).catch(error => {
    console.error('[Preload] Failed to preload backgrounds:', error);
    preloaded = false;
    preloadPromise = null;
  });
  
  return preloadPromise;
}


