import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, Phone, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForgotPasswordFlow } from './hooks/useForgotPasswordFlow';
import ResetSteps from './components/ResetSteps';
import AuthShell from './components/AuthShell';
import {
  labelClass, iconWrapClass, iconClass, eyeButtonClass, inputClass,
  primaryButtonClass, secondaryButtonClass, linkClass, FieldError, ErrorBanner,
} from './components/authUi';

const Spinner = () => (
  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const { step, method, setMethod, identifier, setStep, loading, emailForm, otpForm, resetForm,
    phoneLookupError, submitIdentifier, submitOtp, submitReset } = useForgotPasswordFlow();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const methods = [
    { value: 'email', label: 'methodEmail', icon: Mail },
    { value: 'phone', label: 'methodPhone', icon: Phone },
  ] as const;

  return (
    <AuthShell
      title={t('forgotTitle')}
      subtitle={t('forgotSubtitle')}
      heroTitleKey="forgotHeroTitle"
      heroSubtitleKey="forgotHeroSubtitle"
    >
      <ResetSteps step={step} />

      {/* Step 1: email / phone */}
      {step === 'email' && (
        <form onSubmit={submitIdentifier} noValidate>
          <div className="reg-grid grid gap-y-5">
            <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-gray-100/80 p-1 dark:border-white/10 dark:bg-white/5">
              {methods.map(({ value, label, icon: Icon }) => {
                const selected = method === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setMethod(value)}
                    className={[
                      'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400',
                      selected
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/40 ring-1 ring-white/30'
                        : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    {t(label)}
                  </button>
                );
              })}
            </div>

            {method === 'email' ? (
              <div className="relative min-w-0">
                <label htmlFor="email" className={labelClass}>{t('labelEmail')}</label>
                <div className="group relative">
                  <span className={iconWrapClass}><Mail className={iconClass} /></span>
                  <input
                    {...emailForm.register('email', {
                      required: t('emailRequired'),
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('emailInvalid') },
                    })}
                    type="email"
                    id="email"
                    aria-invalid={!!emailForm.formState.errors.email}
                    className={inputClass(!!emailForm.formState.errors.email)}
                    placeholder={t('placeholderEmailRegistered')}
                  />
                </div>
                <FieldError message={emailForm.formState.errors.email?.message as string | undefined} />
              </div>
            ) : (
              <div className="relative min-w-0">
                <label htmlFor="phone" className={labelClass}>{t('labelPhone')}</label>
                <div className="group relative">
                  <span className={iconWrapClass}><Phone className={iconClass} /></span>
                  <input
                    {...emailForm.register('phone', {
                      required: t('phoneRequired'),
                      validate: (v) => (Boolean(v) && /^[+\d][\d\s\-()]{5,20}$/.test(String(v))) || t('phoneInvalid'),
                    })}
                    type="tel"
                    id="phone"
                    aria-invalid={!!emailForm.formState.errors.phone}
                    className={inputClass(!!emailForm.formState.errors.phone)}
                    placeholder={t('placeholderPhoneRegistered')}
                  />
                </div>
                {emailForm.formState.errors.phone && !phoneLookupError && (
                  <FieldError message={emailForm.formState.errors.phone.message as string} />
                )}
              </div>
            )}
          </div>

          {method === 'phone' && phoneLookupError && emailForm.formState.errors.phone && (
            <div className="mt-4"><ErrorBanner message={t('phoneNotRegistered')} /></div>
          )}

          <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-6`}>
            {loading ? (<><Spinner />{t('sendingOtp')}</>) : (
              <>{t('sendOtp')}<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" /></>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={submitOtp} noValidate>
          <div className="relative min-w-0">
            <label htmlFor="otp" className={labelClass}>{t('otpInputLabel')}</label>
            <div className="group relative">
              <span className={iconWrapClass}><KeyRound className={iconClass} /></span>
              <input
                {...otpForm.register('otp', {
                  required: t('otpRequired'),
                  pattern: { value: /^\d{6}$/, message: t('otpInvalid') },
                })}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                id="otp"
                aria-invalid={!!otpForm.formState.errors.otp}
                className={`${inputClass(!!otpForm.formState.errors.otp)} font-semibold tracking-[0.4em]`}
                placeholder={t('otpPlaceholder')}
              />
            </div>
            <FieldError message={otpForm.formState.errors.otp?.message} />
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            {t('sentTo')}
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">{identifier.value}</span>
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={() => setStep('email')} className={secondaryButtonClass}>
              <ArrowLeft className="h-4 w-4" />{t('back')}
            </button>
            <button type="submit" disabled={loading} className={`${primaryButtonClass} flex-1`}>
              {loading ? (<><Spinner />{t('verifyingOtp')}</>) : (
                <>{t('verifyOtp')}<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" /></>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: new password */}
      {step === 'reset' && (
        <form onSubmit={submitReset} noValidate>
          <div className="reg-grid grid gap-y-5">
            <div className="relative min-w-0">
              <label htmlFor="newPassword" className={labelClass}>{t('newPassword')}</label>
              <div className="group relative">
                <span className={iconWrapClass}><Lock className={iconClass} /></span>
                <input
                  {...resetForm.register('newPassword', { required: t('newPasswordRequired'), minLength: { value: 6, message: t('min6Chars') } })}
                  type={showNew ? 'text' : 'password'}
                  id="newPassword"
                  autoComplete="new-password"
                  aria-invalid={!!resetForm.formState.errors.newPassword}
                  className={inputClass(!!resetForm.formState.errors.newPassword, 'pr-11')}
                  placeholder={t('newPasswordPlaceholder', { defaultValue: ' ' }) || ''}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} aria-label={t('newPassword')} aria-pressed={showNew} className={eyeButtonClass}>
                  {showNew ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              <FieldError message={resetForm.formState.errors.newPassword?.message} />
            </div>

            <div className="relative min-w-0">
              <label htmlFor="confirmPassword" className={labelClass}>{t('confirmPassword')}</label>
              <div className="group relative">
                <span className={iconWrapClass}><Lock className={iconClass} /></span>
                <input
                  {...resetForm.register('confirmPassword', { required: t('confirmPasswordRequired') })}
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  aria-invalid={!!resetForm.formState.errors.confirmPassword}
                  className={inputClass(!!resetForm.formState.errors.confirmPassword, 'pr-11')}
                  placeholder={t('confirmPasswordPlaceholder')}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={t('confirmPassword')} aria-pressed={showConfirm} className={eyeButtonClass}>
                  {showConfirm ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              <FieldError message={resetForm.formState.errors.confirmPassword?.message} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="button" onClick={() => setStep('otp')} className={secondaryButtonClass}>
              <ArrowLeft className="h-4 w-4" />{t('back')}
            </button>
            <button type="submit" disabled={loading} className={`${primaryButtonClass} flex-1`}>
              {loading ? (<><Spinner />{t('resettingPassword')}</>) : (
                <>{t('resetPassword')}<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" /></>
              )}
            </button>
          </div>
        </form>
      )}

      <p className="reg-login mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
        {t('rememberedPassword')}{' '}
        <Link to="/login" className={linkClass}>{t('loginCta')}</Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPassword;
