import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Check } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import { useTranslation } from 'react-i18next';
import LoginHeader from './components/LoginHeader';
import { useLoginForm } from './hooks/useLoginForm';
import { authService } from '@/services/authService';

const Login = () => {
  const { t } = useTranslation('auth');
  const { showPassword, setShowPassword, showGoogleModal, setShowGoogleModal,
    isLoading, error, register, handleSubmit, errors, handleGoogleClick,
    handleGoogleSuccess, onSubmit, GOOGLE_CLIENT_ID, setValue } = useLoginForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center px-4 py-12 xl-down:py-10 lg-down:py-9 md-down:py-8 sm-down:py-6 xs-down:py-5 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2 relative">
      {/* Auth controls: select language before signing in, without leaving the page. */}
      <div className="fixed top-4 right-4 z-50 flex items-start gap-2 lg-down:top-3 lg-down:right-3 md-down:top-2.5 md-down:right-2.5 sm-down:top-2 sm-down:right-2">
        <LanguageSwitcher inlineSubmenu />
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full relative z-[1]">
        <LoginHeader />

        {/* Login Form */}
        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8 xl-down:p-7 lg-down:p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg-down:space-y-5 md-down:space-y-4 sm-down:space-y-3.5 xs-down:space-y-3">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <Mail className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <input
                  {...register('email', {
                    required: 'emailRequired',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'emailInvalid'
                    }
                  })}
                  type="email"
                  id="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm xs-down:text-xs"
                  placeholder={t('enterEmail')}
                  onBlur={async (e) => {
                    const email = e.target.value.trim();
                    if (!email) return;
                    // Quick client-side email check before calling backend
                    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                    if (!ok) return;
                    try {
                      const { remember } = await authService.getRememberPref(email);
                      setValue('remember', !!remember, { shouldDirty: true });
                    } catch {}
                  }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 md-down:text-xs">{t(errors.email.message ?? '')}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
{t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <Lock className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <input
                  {...register('password', {
                    required: 'passwordRequired'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 lg-down:pr-10 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm sm-down:pr-9 xs-down:text-xs"
                  placeholder={t('enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center lg-down:pr-2.5 sm-down:pr-2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 md-down:text-xs">{t(errors.password.message ?? '')}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between sm-down:flex-col sm-down:gap-3 sm-down:items-start">
              <label
                htmlFor="remember"
                className="group relative inline-flex min-h-10 max-w-full cursor-pointer select-none items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/5 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/80 hover:shadow-md dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-blue-500/60 dark:hover:bg-slate-700/80 md-down:text-xs sm-down:gap-2 sm-down:px-2.5 sm-down:py-1.5"
              >
                <input
                  id="remember"
                  {...register('remember')}
                  type="checkbox"
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-[7px] border-2 border-slate-300 bg-white shadow-sm transition-all duration-200 group-hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:shadow-[0_2px_7px_rgba(37,99,235,0.25)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500 dark:border-slate-500 dark:bg-slate-900 dark:group-hover:border-blue-400 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500"
                />
                <Check
                  aria-hidden="true"
                  strokeWidth={3}
                  className="pointer-events-none absolute left-[15px] h-[15px] w-[15px] scale-75 text-white opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100 sm-down:left-[13px]"
                />
                <span className="leading-snug transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {t('rememberMe')}
                </span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200 md-down:text-xs">
{t('forgotPasswordLink')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:py-2 xs-down:text-xs"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm-down:w-4 sm-down:h-4 sm-down:mr-1.5 xs-down:w-3.5 xs-down:h-3.5"></div>
{t('loggingIn')}
                </div>
              ) : (
t('login')
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50/90 p-4 transition-colors duration-200 dark:border-red-800/60 dark:bg-red-950/40 lg-down:p-3.5 md-down:p-3 sm-down:p-2.5">
                <p className="text-sm text-red-700 dark:text-red-300 md-down:text-xs">{t(error)}</p>
              </div>
            )}
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center lg-down:mt-5 md-down:mt-4 sm-down:mt-3.5">
            <p className="text-sm text-gray-600 dark:text-gray-300 md-down:text-xs">
{t('noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
{t('signUpNow')}
              </Link>
            </p>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="mt-6 lg-down:mt-5 md-down:mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-500 dark:text-gray-400 md-down:text-xs">{t('orLoginWith')}</span>
            </div>
          </div>

          <div className="mt-6 lg-down:mt-5 md-down:mt-4">
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white/50 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all duration-200 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:py-2 xs-down:text-xs"
            >
              <svg className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-2 sm-down:ml-1.5">Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Sign-In Modal */}
      {showGoogleModal && GOOGLE_CLIENT_ID && (
        <GoogleSignInModal
          clientId={GOOGLE_CLIENT_ID}
          onSuccess={handleGoogleSuccess}
          onClose={() => setShowGoogleModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
