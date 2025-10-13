import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';

type Theme = 'light' | 'dark' | 'dark-black';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
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
      if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'dark-black') return savedTheme as Theme;
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
        if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'dark-black') {
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
    root.classList.remove('light', 'dark', 'dark-black');
    // For dark-black, add both 'dark' and 'dark-black' classes
    if (theme === 'dark-black') {
      root.classList.add('dark', 'dark-black');
    } else {
      root.classList.add(theme);
    }
    try { localStorage.setItem('theme', theme); } catch {}
    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
    } catch {}
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // Persist to backend only if authenticated
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        // fire-and-forget
        settingsService.setTheme(newTheme).catch(() => {
          // Optionally revert on error; keep current UX simple and optimistic
        });
      }
    } catch {}
  };

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
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Safe fallback to avoid crashes if used outside provider during fast reloads
    const currentTheme: Theme = (() => {
      try {
        const ls = localStorage.getItem('theme');
        if (ls === 'dark' || ls === 'light' || ls === 'dark-black') return ls as Theme;
      } catch {}
      if (document.documentElement.classList.contains('dark-black')) return 'dark-black';
      if (document.documentElement.classList.contains('dark')) return 'dark';
      return 'light';
    })();
    const toggleTheme = () => {
      try {
        const next = currentTheme === 'light' ? 'dark' : 'light';
        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'dark-black');
        root.classList.add(next);
        try { localStorage.setItem('theme', next); } catch {}
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `theme=${next}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
      } catch {}
    };
    const setTheme = (theme: Theme) => {
      try {
        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'dark-black');
        if (theme === 'dark-black') {
          root.classList.add('dark', 'dark-black');
        } else {
          root.classList.add(theme);
        }
        try { localStorage.setItem('theme', theme); } catch {}
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
      } catch {}
    };
    return { theme: currentTheme, setTheme, toggleTheme };
  }
  return context;
};
