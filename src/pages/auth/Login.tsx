import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Check, ArrowRight } from 'lucide-react';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from './hooks/useLoginForm';
import { authService } from '@/services/authService';
import AuthShell from './components/AuthShell';
import {
  labelClass, iconWrapClass, iconClass, eyeButtonClass, inputClass,
  primaryButtonClass, secondaryButtonClass, linkClass, FieldError, ErrorBanner,
} from './components/authUi';

const Login = () => {
  const { t } = useTranslation('auth');
  const { showPassword, setShowPassword, showGoogleModal, setShowGoogleModal,
    isLoading, error, register, handleSubmit, errors, handleGoogleClick,
    handleGoogleSuccess, onSubmit, GOOGLE_CLIENT_ID, setValue, remember } = useLoginForm();

  return (
    <>
    <AuthShell
      title={t('welcomeBack')}
      subtitle={t('loginSubtitle')}
      heroTitleKey="loginHeroTitle"
      heroSubtitleKey="loginHeroSubtitle"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="reg-grid grid gap-y-5">
          {/* Email */}
          <div className="relative min-w-0">
            <label htmlFor="email" className={labelClass}>{t('email')}</label>
            <div className="group relative">
              <span className={iconWrapClass}><Mail className={iconClass} /></span>
              <input
                {...register('email', {
                  required: 'emailRequired',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'emailInvalid',
                  },
                })}
                type="email"
                id="email"
                autoComplete="username"
                aria-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
                placeholder={t('enterEmail')}
                onBlur={async (e) => {
                  const email = e.target.value.trim();
                  if (!email) return;
                  // Quick client-side email check before calling backend
                  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                  if (!ok) return;
                  try {
                    const { remember: pref } = await authService.getRememberPref(email);
                    setValue('remember', !!pref, { shouldDirty: true });
                  } catch {}
                }}
              />
            </div>
            <FieldError message={errors.email ? t(errors.email.message ?? '') : undefined} />
          </div>

          {/* Password */}
          <div className="relative min-w-0">
            <label htmlFor="password" className={labelClass}>{t('password')}</label>
            <div className="group relative">
              <span className={iconWrapClass}><Lock className={iconClass} /></span>
              <input
                {...register('password', { required: 'passwordRequired' })}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className={inputClass(!!errors.password, 'pr-11')}
                placeholder={t('enterPassword')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={t('password')}
                aria-pressed={showPassword}
                className={eyeButtonClass}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
            <FieldError message={errors.password ? t(errors.password.message ?? '') : undefined} />
          </div>

          {/* Remember me + forgot password */}
          <div className="flex items-center justify-between gap-3 sm-down:flex-wrap">
            <label htmlFor="remember" className="group inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-gray-700 dark:text-gray-200">
              <input id="remember" type="checkbox" {...register('remember')} className="peer sr-only" />
              <span
                aria-hidden="true"
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-purple-400 peer-focus-visible:ring-offset-1 dark:peer-focus-visible:ring-offset-gray-900',
                  remember
                    ? 'border-transparent bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/30'
                    : 'border-gray-300 bg-white/80 text-transparent group-hover:border-purple-400 dark:border-gray-600 dark:bg-gray-900/50 dark:group-hover:border-purple-400',
                ].join(' ')}
              >
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
              <span className="transition-colors duration-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">{t('rememberMe')}</span>
            </label>
            <Link to="/forgot-password" className={`text-sm ${linkClass}`}>
              {t('forgotPasswordLink')}
            </Link>
          </div>
        </div>

        {/* Server / request error */}
        {error && <div className="mt-5"><ErrorBanner message={t(error)} /></div>}

        {/* Submit */}
        <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-6`}>
          {isLoading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t('loggingIn')}
            </>
          ) : (
            <>
              {t('login')}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider + Google */}
      <div className="my-5 flex items-center gap-3 [@media(min-width:1024px)_and_(max-height:700px)]:my-3">
        <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('orLoginWith')}</span>
        <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
      </div>

      <button type="button" onClick={handleGoogleClick} className={`${secondaryButtonClass} w-full py-2.5`}>
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </button>

      {/* Register link */}
      <p className="reg-login mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
        {t('noAccount')}{' '}
        <Link to="/register" className={linkClass}>
          {t('signUpNow')}
        </Link>
      </p>
    </AuthShell>

      {/* Google Sign-In Modal (outside the shell: the card's backdrop-blur would trap a fixed overlay) */}
      {showGoogleModal && GOOGLE_CLIENT_ID && (
        <GoogleSignInModal
          clientId={GOOGLE_CLIENT_ID}
          onSuccess={handleGoogleSuccess}
          onClose={() => setShowGoogleModal(false)}
        />
      )}
    </>
  );
};

export default Login;
