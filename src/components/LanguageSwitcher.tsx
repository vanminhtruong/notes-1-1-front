import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
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
  { code: 'en', name: 'English', Flag: US },
  { code: 'ko', name: '한국어', Flag: KR },
  { code: 'vi', name: 'Tiếng Việt', Flag: VN },
];

interface LanguageSwitcherProps {
  direction?: 'up' | 'down';
}

const LanguageSwitcher = memo(({ direction = 'down' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [previewLang, setPreviewLang] = useState<Language | null>(null);

  const defaultLang = languages.find((l) => l.code === 'vi') || languages[0];
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || defaultLang;

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

  // Close flag preview on Escape
  useEffect(() => {
    if (!previewLang) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewLang(null);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [previewLang]);

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
          className={`absolute right-0 w-56 rounded-xl border border-white/20 dark:border-gray-700/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl overflow-hidden z-50 transition-all duration-200 ${
            direction === 'up' ? 'bottom-full mb-2 origin-bottom' : 'mt-2 origin-top'
          }`}
        >
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <span
                  className="leading-none inline-flex items-center cursor-zoom-in"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewLang(language);
                  }}
                  title={language.name}
                  aria-label={`Preview ${language.name} flag`}
                >
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
      {previewLang && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60"
          onClick={() => setPreviewLang(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center rounded-md overflow-hidden">
                <previewLang.Flag className="h-24 w-auto rounded-md shadow" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{previewLang.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{previewLang.code.toUpperCase()}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setPreviewLang(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
