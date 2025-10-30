import '@/polyfills/global'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.scss'
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

// Prepare audio unlock on first user interaction (autoplay policy)
unlockAudioOnce()

const currentUser = getCachedUser();

// Preload animated background bundles if user is already in dark-black theme
try {
  const lsTheme = localStorage.getItem('theme');
  const isDarkBlack = lsTheme === 'dark-black' || document.documentElement.classList.contains('dark-black');
  if (isDarkBlack) {
    preloadAnimatedBackgrounds();
  }
} catch {}

createRoot(document.getElementById('root')!).render(
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
