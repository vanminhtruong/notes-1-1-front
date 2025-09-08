import '@/polyfills/global'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import { RouterProvider } from 'react-router-dom'
import router from '@routes/index'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
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
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
          />
          <GlobalCallUI />
        </CallProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
