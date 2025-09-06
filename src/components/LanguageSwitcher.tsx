import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { VN, US, KR } from 'country-flag-icons/react/3x2';

interface Language {
  code: string;
  name: string;
  Flag: ComponentType<SVGProps<SVGSVGElement>>;
}

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', Flag: VN },
  { code: 'en', name: 'English', Flag: US },
  { code: 'ko', name: '한국어', Flag: KR },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Persist to backend if authenticated
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const { settingsService } = await import('@/services/settingsService');
        settingsService.setLanguage(langCode).catch(() => {
          // Silent fail for UX
        });
      }
    } catch {}
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 dark:border-gray-700/40 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex items-center gap-2">
          <span className="leading-none inline-flex items-center">
            <currentLanguage.Flag className="h-4 w-auto rounded-[2px] shadow-sm" />
          </span>
          <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
            {currentLanguage.code.toUpperCase()}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-xl border border-white/20 dark:border-gray-700/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
        >
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              Ngôn ngữ / Language
            </div>
            <div className="my-1 h-px bg-white/30 dark:bg-gray-700/50" />
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                }`}
                role="menuitem"
              >
                <span className="leading-none inline-flex items-center">
                  <language.Flag className="h-4 w-auto rounded-[2px] shadow-sm" />
                </span>
                <span className="flex-1 text-left">{language.name}</span>
                {currentLanguage.code === language.code && (
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
