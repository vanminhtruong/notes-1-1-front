import '@/polyfills/global'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.scss'
import '@/styles/android-webview.scss'
import '@/components/RichTextEditor/checklist.css'
import { RouterProvider } from 'react-router-dom'
import router from '@routes/index'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemedToaster } from '@/components/ThemedToaster'
import '@/libs/i18n'
import { unlockAudioOnce } from '@/utils/notificationSound'
import { CallProvider, GlobalCallUI } from '@/contexts/CallContext'
import { getCachedUser } from '@pages/Dashboard/components/interface/chatWindowImports'
import AnimatedBackground from '@/components/AnimatedBackground'
import { preloadAnimatedBackgrounds } from '~/utils/preload'
import { getAndroidBackendOrigin, isNativeApp } from '@/services/backendOrigin'
import AndroidServerSetup from '@/components/AndroidServerSetup'

// Apply WebView-specific CSS only in native Android; browser layout stays unchanged.
if (isNativeApp) {
  document.documentElement.classList.add('capacitor-android');
}

// Offline PWA shell is served in production/preview only. Never cache authenticated APIs.
// Keep existing PWA worker on root deployments; Pages uses a repo subpath.
if (import.meta.env.PROD && !isNativeApp && import.meta.env.BASE_URL === '/' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(error => {
      console.warn('[PWA] Service worker registration failed', error);
    });
  }, { once: true });
}

// Prepare audio unlock on first user interaction (autoplay policy)
unlockAudioOnce()

if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('backgroundPerf')) {
  void import('./dev/backgroundPerformance').then(({ mountBackgroundPerformance }) => mountBackgroundPerformance());
}

const currentUser = getCachedUser();

// Preload animated background bundles if user is already in dark-black theme
try {
  const lsTheme = localStorage.getItem('theme');
  const isDarkBlack = lsTheme === 'dark-black' || document.documentElement.classList.contains('dark-black');
  if (isDarkBlack) {
    preloadAnimatedBackgrounds();
  }
} catch {}

const root = createRoot(document.getElementById('root')!)
if (isNativeApp && !getAndroidBackendOrigin()) {
  root.render(<AndroidServerSetup />)
} else {
  root.render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <CallProvider currentUserId={currentUser?.id ?? null}>
          <AnimatedBackground />
          <RouterProvider router={router} />
          <ThemedToaster />
          <GlobalCallUI />
        </CallProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
}
