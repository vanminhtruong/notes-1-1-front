import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from storage/cookie to match index.html boot script
  const getInitialTheme = (): Theme => {
    try {
      let savedTheme: string | null = null;
      try { savedTheme = localStorage.getItem('theme'); } catch {}
      if (!savedTheme) {
        const cookieTheme = document.cookie.split(';').find(c => c.trim().startsWith('theme='));
        savedTheme = cookieTheme ? cookieTheme.split('=')[1].trim() : null;
      }
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme as Theme;
      // Fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  };
  
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  // Load theme from backend on mount (only if no cookie exists)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          return; // Already handled by getInitialTheme
        }

        // Check if cookie already exists - if so, skip backend call to prevent flash
        const cookieTheme = document.cookie.split(';').find(c => c.trim().startsWith('theme='));
        const savedTheme = cookieTheme ? cookieTheme.split('=')[1].trim() : null;
        if (savedTheme === 'dark' || savedTheme === 'light') {
          return; // Cookie exists, don't override
        }

        // No cookie, fetch from backend
        const res = await settingsService.getTheme();
        if (mounted) setTheme(res.mode);
      } catch {
        // Backend error, keep current theme (already set from getInitialTheme)
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Apply theme class to document and persist to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try { localStorage.setItem('theme', theme); } catch {}
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      // Persist to backend only if authenticated
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          // fire-and-forget
          settingsService.setTheme(next).catch(() => {
            // Optionally revert on error; keep current UX simple and optimistic
          });
        }
      } catch {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Safe fallback to avoid crashes if used outside provider during fast reloads
    const isDark = (() => {
      try {
        const ls = localStorage.getItem('theme');
        if (ls === 'dark' || ls === 'light') return ls === 'dark';
      } catch {}
      return document.documentElement.classList.contains('dark');
    })();
    const toggleTheme = () => {
      try {
        const next = isDark ? 'light' : 'dark';
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(next);
        try { localStorage.setItem('theme', next); } catch {}
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `theme=${next}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
      } catch {}
    };
    return { theme: isDark ? 'dark' as const : 'light' as const, toggleTheme };
  }
  return context;
};
