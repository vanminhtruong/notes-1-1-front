import { useEffect, useRef, memo } from 'react';
import { X, ShieldCheck, KeyRound, Zap, Lock } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';
import { useTranslation } from 'react-i18next';

interface GoogleSignInModalProps {
  clientId: string;
  onSuccess: (credential: string) => void;
  onClose: () => void;
}

const GoogleSignInModal = memo(({ clientId, onSuccess, onClose }: GoogleSignInModalProps) => {
  const { t } = useTranslation('auth');
  const buttonRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when modal is mounted
  useEffect(() => {
    lockBodyScroll('GoogleSignInModal');
    return () => {
      unlockBodyScroll('GoogleSignInModal');
    };
  }, []);

  useEffect(() => {
    if (!window.google?.accounts?.id || !buttonRef.current) return;

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response?.credential) {
          onSuccess(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });

    // Match the app theme: dark surface -> dark Google button, light surface -> outlined button.
    const isDark = document.documentElement.classList.contains('dark');
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: isDark ? 'filled_black' : 'outline',
      size: 'large',
      text: 'signin_with',
      width: 320,
      shape: 'pill',
      logo_alignment: 'left',
    });
  }, [clientId, onSuccess]);

  const chips = [
    { icon: ShieldCheck, label: t('googleModal.secure') },
    { icon: KeyRound, label: t('googleModal.noPassword') },
    { icon: Zap, label: t('googleModal.fast') },
  ];

  return (
    <>
      <style>{`
        @keyframes gsm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gsm-pop {
          from { opacity: 0; transform: translateY(16px) scale(.95); }
          to { opacity: 1; transform: none; }
        }
        @keyframes gsm-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes gsm-spin { to { transform: rotate(360deg); } }
        @keyframes gsm-pulse {
          0%, 100% { opacity: .55; transform: scale(1); }
          50% { opacity: .9; transform: scale(1.12); }
        }
        @keyframes gsm-float-a {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(14px,10px,0); }
        }
        @keyframes gsm-float-b {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-12px,-12px,0); }
        }
        @keyframes gsm-sheen {
          0% { transform: translateX(-120%); }
          60%, 100% { transform: translateX(220%); }
        }
        .gsm-backdrop { animation: gsm-fade .2s ease-out both; }
        .gsm-card { animation: gsm-pop .38s cubic-bezier(.16,1,.3,1) both; }
        .gsm-item { animation: gsm-rise .5s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--d, 0s); }
        .gsm-ring { animation: gsm-spin 14s linear infinite; }
        .gsm-glow { animation: gsm-pulse 3.6s ease-in-out infinite; }
        .gsm-orb-a { animation: gsm-float-a 9s ease-in-out infinite; }
        .gsm-orb-b { animation: gsm-float-b 11s ease-in-out infinite; }
        .gsm-sheen { animation: gsm-sheen 5.5s ease-in-out 1s infinite; }
        .gsm-slot { transition: border-color .25s ease, box-shadow .25s ease; }
        .gsm-slot:hover {
          border-color: rgba(139, 92, 246, .55);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, .12), 0 10px 30px -12px rgba(99, 102, 241, .45);
        }
        @media (prefers-reduced-motion: reduce) {
          .gsm-backdrop, .gsm-card, .gsm-item, .gsm-ring, .gsm-glow,
          .gsm-orb-a, .gsm-orb-b, .gsm-sheen { animation: none; }
        }
      `}</style>

      {/* Overlay backdrop (does not close the modal; only the X button does) */}
      <div className="gsm-backdrop fixed inset-0 bg-black/65 backdrop-blur-sm z-[9998]" />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        {/* Gradient hairline border */}
        <div className="gsm-card pointer-events-auto w-full max-w-[440px] rounded-[28px] bg-gradient-to-b from-violet-500/60 via-indigo-500/15 to-fuchsia-500/30 p-px shadow-2xl shadow-indigo-500/20">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-signin-title"
            className="relative overflow-hidden rounded-[27px] bg-white dark:bg-gray-900 dark-black:bg-[#0a0a0a]"
          >
            {/* Top accent bar with moving sheen */}
            <div className="absolute inset-x-0 top-0 z-10 h-[3px] overflow-hidden bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500">
              <div className="gsm-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>

            {/* Decorative background: dot grid + soft orbs + brand glow */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-x-0 top-0 h-56 opacity-60 dark:opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(139,92,246,0.45) 1px, transparent 1.4px)',
                  backgroundSize: '18px 18px',
                  WebkitMaskImage: 'radial-gradient(70% 100% at 50% 0%, #000 0%, transparent 100%)',
                  maskImage: 'radial-gradient(70% 100% at 50% 0%, #000 0%, transparent 100%)',
                }}
              />
              <div
                className="absolute inset-x-0 top-0 h-48"
                style={{
                  background:
                    'radial-gradient(70% 100% at 50% 0%, rgba(139,92,246,0.24) 0%, rgba(99,102,241,0.10) 45%, rgba(0,0,0,0) 100%)',
                }}
              />
              <div className="gsm-orb-a absolute -left-10 top-24 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
              <div className="gsm-orb-b absolute -right-10 bottom-16 h-36 w-36 rounded-full bg-fuchsia-500/15 blur-2xl" />
            </div>

            {/* Close button (the only way to dismiss) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-gray-500 transition-all hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:rotate-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-[18px] w-[18px]" />
            </button>

            <div className="relative px-8 pb-7 pt-11 md-down:px-5">
              {/* Header */}
              <div className="mb-7 text-center">
                <div className="gsm-item relative mx-auto mb-5 h-[88px] w-[88px]" style={{ ['--d' as any]: '.05s' }}>
                  {/* Pulsing glow */}
                  <div
                    aria-hidden="true"
                    className="gsm-glow absolute inset-1 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 blur-xl"
                  />
                  {/* Rotating dashed orbit */}
                  <svg
                    aria-hidden="true"
                    className="gsm-ring absolute inset-0 h-full w-full text-violet-500/60 dark:text-violet-400/50"
                    viewBox="0 0 88 88"
                    fill="none"
                  >
                    <circle cx="44" cy="44" r="42" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 7" strokeLinecap="round" />
                    <circle cx="44" cy="2" r="3" fill="#8b5cf6" />
                  </svg>
                  {/* Logo tile */}
                  <div className="absolute inset-[14px] flex items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                    <svg className="h-9 w-9" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  {/* Lock badge */}
                  <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md ring-2 ring-white dark:ring-gray-900 dark-black:ring-[#0a0a0a]">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                  </div>
                </div>

                <h3
                  id="google-signin-title"
                  className="gsm-item mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
                  style={{ ['--d' as any]: '.12s' }}
                >
                  {t('googleModal.title')}
                </h3>
                <p
                  className="gsm-item mx-auto max-w-[300px] text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                  style={{ ['--d' as any]: '.18s' }}
                >
                  {t('googleModal.subtitle')}
                </p>
              </div>

              {/* Google Sign-In Button (rendered by Google inside this slot) */}
              <div
                className="gsm-item gsm-slot flex justify-center rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700/60 dark:bg-gray-800/50 dark-black:border-[#242424] dark-black:bg-[#121212]"
                style={{ ['--d' as any]: '.25s' }}
              >
                <div ref={buttonRef} className="max-w-full overflow-hidden" />
              </div>

              {/* Trust chips */}
              <div
                className="gsm-item mt-5 flex flex-wrap items-center justify-center gap-2"
                style={{ ['--d' as any]: '.32s' }}
              >
                {chips.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300"
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>

              {/* Divider with center icon */}
              <div
                className="gsm-item mt-6 flex items-center gap-3"
                style={{ ['--d' as any]: '.38s' }}
                aria-hidden="true"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-700/70 dark-black:to-[#2a2a2a]" />
                <ShieldCheck className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-700/70 dark-black:to-[#2a2a2a]" />
              </div>

              {/* Terms */}
              <p
                className="gsm-item mt-4 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400"
                style={{ ['--d' as any]: '.44s' }}
              >
                {t('googleModal.termsText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

GoogleSignInModal.displayName = 'GoogleSignInModal';

export default GoogleSignInModal;
