import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark'

export interface ThemeState {
  mode: ThemeMode
}

function getInitialMode(): ThemeMode {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme') as ThemeMode | null
      if (saved === 'light' || saved === 'dark') return saved
      // fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }
  } catch {
    // ignore and fallback
  }
  return 'light'
}

const initialState: ThemeState = {
  mode: getInitialMode(),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state: ThemeState, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload
    },
    toggleTheme(state: ThemeState) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
