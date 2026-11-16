import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { Mail, KeyRound, Lock, ShieldCheck, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForgotPasswordFlow } from './hooks/useForgotPasswordFlow';
import ResetSteps from './components/ResetSteps';


const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const { step, method, setMethod, identifier, setStep, loading, emailForm, otpForm, resetForm,
    phoneLookupError, submitIdentifier, submitOtp, submitReset } = useForgotPasswordFlow();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md-down:py-10 sm-down:py-8 xs-down:py-6 relative">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full relative z-[1]">
        <div className="text-center mb-8 xs-down:mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-2">{t('forgotTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-300 xs-down:text-sm px-2">{t('forgotSubtitle')}</p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8 md-down:p-7 sm-down:p-6 xs-down:p-5">
          <ResetSteps step={step} />

          {step === 'email' && (
            <form onSubmit={submitIdentifier} className="space-y-6 xs-down:space-y-5">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setMethod('email')} className={`flex-1 py-2 xs-down:py-1.5 rounded-lg border ${method === 'email' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>{t('methodEmail')}</button>
                <button type="button" onClick={() => setMethod('phone')} className={`flex-1 py-2 xs-down:py-1.5 rounded-lg border ${method === 'phone' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>{t('methodPhone')}</button>
              </div>

              {method === 'email' ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('labelEmail')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...emailForm.register('email', {
                        required: t('emailRequired'),
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('emailInvalid') },
                      })}
                      type="email"
                      id="email"
                      className="block w-full pl-10 pr-3 py-3 xs-down:py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder={t('placeholderEmailRegistered')}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message as string}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('labelPhone')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...emailForm.register('phone', {
                        required: t('phoneRequired'),
                        validate: (v) => Boolean(v) && /^[+\d][\d\s\-()]{5,20}$/.test(String(v)) || t('phoneInvalid'),
                      })}
                      type="tel"
                      id="phone"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder={t('placeholderPhoneRegistered')}
                    />
                  </div>
                  {emailForm.formState.errors.phone && (
                    <p role={phoneLookupError ? 'alert' : undefined} className="mt-2 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300">{phoneLookupError ? t('phoneNotRegistered') : emailForm.formState.errors.phone.message as string}</p>
                  )}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 xs-down:py-2.5 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {loading ? t('sendingOtp') : t('sendOtp')}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={submitOtp} className="space-y-6 xs-down:space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('otpInputLabel')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...otpForm.register('otp', {
                      required: t('otpRequired'),
                      pattern: { value: /^\d{6}$/, message: t('otpInvalid') },
                    })}
                    inputMode="numeric"
                    maxLength={6}
                    id="otp"
                    className="block w-full pl-10 pr-3 py-3 xs-down:py-2.5 tracking-widest uppercase border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder={t('otpPlaceholder')}
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">{t('sentTo')} <span className="font-medium">{identifier.value}</span></p>
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('email')} className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-300 hover:underline">{t('back')}</button>
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 xs-down:py-2.5 px-5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {loading ? t('verifyingOtp') : t('verifyOtp')}
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={submitReset} className="space-y-6 xs-down:space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('newPassword')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...resetForm.register('newPassword', { required: t('newPasswordRequired'), minLength: { value: 6, message: t('min6Chars') } })}
                    type="password"
                    id="newPassword"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder={t('newPasswordPlaceholder', { defaultValue: ' ' }) || ''}
                  />
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('confirmPassword')}</label>
                <input
                  {...resetForm.register('confirmPassword', { required: t('confirmPasswordRequired') })}
                  type="password"
                  id="confirmPassword"
                  className="block w-full py-3 xs-down:py-2.5 px-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('confirmPasswordPlaceholder')}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('otp')} className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-300 hover:underline">{t('back')}</button>
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 xs-down:py-2.5 px-5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {loading ? t('resettingPassword') : t('resetPassword')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 xs-down:mt-6 text-center">
            <p className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-300">
              {t('rememberedPassword')}{' '}
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200">
                {t('loginCta')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
