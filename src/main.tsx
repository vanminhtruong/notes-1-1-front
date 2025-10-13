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

// Prepare audio unlock on first user interaction (autoplay policy)
unlockAudioOnce()

const currentUser = getCachedUser();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <CallProvider currentUserId={currentUser?.id ?? null}>
          <RouterProvider router={router} />
          <ThemedToaster />
          <GlobalCallUI />
        </CallProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
