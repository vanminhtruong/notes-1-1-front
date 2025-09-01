import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from cookie to match index.html boot script
  const getInitialTheme = (): Theme => {
    try {
      const cookieTheme = document.cookie.split(';').find(c => c.trim().startsWith('theme='));
      const savedTheme = cookieTheme ? cookieTheme.split('=')[1].trim() : null;
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
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

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
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
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
