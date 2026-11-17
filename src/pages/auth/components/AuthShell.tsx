import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RegisterShowcase from './RegisterShowcase';
import '../register.css';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  /** Translation keys (namespace "auth") for the brand panel hero text. */
  heroTitleKey: string;
  heroSubtitleKey: string;
  children: ReactNode;
}

/**
 * Shared frame for the login / forgot-password pages. Mirrors the register page:
 * brand panel + form card, fits the viewport on desktop (no page scroll), stacks on mobile.
 * Reuses the `reg-*` hooks from register.css so short laptop windows (e.g. 1366x768) also fit.
 */
export default function AuthShell({ title, subtitle, heroTitleKey, heroSubtitleKey, children }: AuthShellProps) {
  return (
    <div className="reg-root relative flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4 py-20 dark:from-gray-900 dark:via-black dark:to-gray-800 md-down:py-16 sm-down:px-3 sm-down:pb-8 sm-down:pt-16 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:px-6 lg:pb-5 lg:pt-14">
      {/* Ambient background decoration */}
      <div aria-hidden="true" className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl dark:bg-purple-600/20" />
      <div aria-hidden="true" className="pointer-events-none fixed -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-600/20" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 text-gray-900/[0.05] dark:text-white/[0.05]"
        style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '26px 26px' }}
      />

      {/* Auth controls: language + theme, available before signing in. */}
      <div className="fixed right-4 top-4 z-50 flex items-start gap-2 lg-down:right-3 lg-down:top-3 md-down:right-2.5 md-down:top-2.5 sm-down:right-2 sm-down:top-2">
        <LanguageSwitcher inlineSubmenu />
        <ThemeToggle />
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-xl lg:max-w-6xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70 dark:shadow-black/50 lg:max-h-[calc(100vh-4.75rem)] lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[minmax(0,1fr)]">
          <RegisterShowcase titleKey={heroTitleKey} subtitleKey={heroSubtitleKey} />

          {/* Form side. Only scrolls internally as a last resort on extremely short windows. */}
          <div className="reg-form-col min-w-0 p-10 md-down:p-7 sm-down:p-5 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:p-9 lg:[scrollbar-width:thin] [@media(min-width:1024px)_and_(max-height:780px)]:p-6">
            <div className="mx-auto w-full max-w-md lg:my-auto">
              <div className="reg-header mb-7 md-down:mb-6 lg:mb-6">
                {/* Brand chip: the brand panel already shows it on large screens. */}
                <div className="mb-5 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">PlantHub</span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md-down:text-2xl lg:text-[1.7rem] lg:leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="reg-header-sub mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{subtitle}</p>
                )}
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
