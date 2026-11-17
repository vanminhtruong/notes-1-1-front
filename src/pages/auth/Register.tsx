import type { FocusEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, User, Mail, Lock, Phone, Calendar, UserCircle, ArrowRight, AlertCircle, CheckCircle2, Check,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import RegisterHeader from './components/RegisterHeader';
import RegisterShowcase from './components/RegisterShowcase';
import PasswordStrength from './components/PasswordStrength';
import { useRegisterForm } from './hooks/useRegisterForm';
import './register.css';

const GENDER_OPTIONS = [
  { value: 'unspecified', label: 'genderUnspecified' },
  { value: 'male', label: 'genderMale' },
  { value: 'female', label: 'genderFemale' },
  { value: 'other', label: 'genderOther' },
] as const;

// Chrome ignores autocomplete="off" on name/email/phone fields, but it never autofills a read-only input.
// The field becomes editable the moment the user touches it, so typing is unaffected.
const unlockField = (e: FocusEvent<HTMLInputElement> | PointerEvent<HTMLInputElement>) =>
  e.currentTarget.removeAttribute('readonly');
const antiAutofill = { readOnly: true, onFocus: unlockField, onPointerDown: unlockField } as const;

const labelClass = 'reg-label mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200';
const iconWrapClass = 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5';
const iconClass =
  'h-[18px] w-[18px] text-gray-400 transition-colors duration-200 group-focus-within:text-purple-500 dark:text-gray-500 dark:group-focus-within:text-purple-400';
const eyeButtonClass =
  'absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-200';

const inputClass = (invalid: boolean, paddingRight = 'pr-3.5') =>
  [
    'reg-input block w-full rounded-xl border bg-white/80 py-2.5 pl-11 text-sm text-gray-900 shadow-sm outline-none',
    'transition-all duration-200 placeholder:text-gray-400 focus:ring-2 lg:text-[15px]',
    'dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500',
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/70'
      : 'border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:ring-purple-500/30 dark:border-gray-700 dark:hover:border-gray-600',
    paddingRight,
  ].join(' ');

// Absolutely positioned inside the row gap: showing or hiding an error never changes the page height,
// so the desktop layout always fits the viewport without scrolling.
const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="absolute left-0 top-full flex items-center gap-1 pt-0.5 text-[11px] leading-4 text-red-600 dark:text-red-400">
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </p>
  ) : null;

const OptionalBadge = ({ text }: { text: string }) => (
  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-white/10 dark:text-gray-400">
    {text}
  </span>
);

const Register = () => {
  const { t } = useTranslation('auth');
  const { showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    isLoading, error, register, handleSubmit, errors, password, confirmPassword, gender, onSubmit } = useRegisterForm();

  const passwordsMatch = !!confirmPassword && confirmPassword === password;

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

      {/* Auth controls: select language before signing in, without leaving the page. */}
      <div className="fixed right-4 top-4 z-50 flex items-start gap-2 lg-down:right-3 lg-down:top-3 md-down:right-2.5 md-down:top-2.5 sm-down:right-2 sm-down:top-2">
        <LanguageSwitcher inlineSubmenu />
        <ThemeToggle />
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-xl lg:max-w-6xl">
        <div className="grid overflow-hidden rounded-3xl border border-white/60 bg-white/75 shadow-2xl shadow-purple-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70 dark:shadow-black/50 lg:max-h-[calc(100vh-4.75rem)] lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[minmax(0,1fr)]">
          <RegisterShowcase />

          {/* Form side. Only scrolls internally as a last resort on extremely short windows. */}
          <div className="reg-form-col min-w-0 p-10 md-down:p-7 sm-down:p-5 lg:min-h-0 lg:overflow-y-auto lg:p-9 lg:[scrollbar-width:thin] [@media(min-width:1024px)_and_(max-height:780px)]:p-6">
            <RegisterHeader />

            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="reg-grid grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                {/* Name */}
                <div className="relative min-w-0">
                  <label htmlFor="name" className={labelClass}>{t('fullName')}</label>
                  <div className="group relative">
                    <span className={iconWrapClass}><User className={iconClass} /></span>
                    <input
                      {...register('name', {
                        required: 'nameRequired',
                        minLength: { value: 2, message: 'nameMinLength' },
                        maxLength: { value: 50, message: 'nameMaxLength' }
                      })}
                      type="text"
                      id="name"
                      autoComplete="off"
                      aria-invalid={!!errors.name}
                      className={inputClass(!!errors.name)}
                      placeholder={t('enterName')}
                      {...antiAutofill}
                    />
                  </div>
                  <FieldError message={errors.name ? t(errors.name.message ?? '') : undefined} />
                </div>

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
                          message: 'emailInvalid'
                        }
                      })}
                      type="email"
                      id="email"
                      autoComplete="off"
                      aria-invalid={!!errors.email}
                      className={inputClass(!!errors.email)}
                      placeholder={t('enterEmail')}
                      {...antiAutofill}
                    />
                  </div>
                  <FieldError message={errors.email ? t(errors.email.message ?? '') : undefined} />
                </div>

                {/* Phone (optional) */}
                <div className="relative min-w-0">
                  <label htmlFor="phone" className={labelClass}>
                    {t('phone')}<OptionalBadge text={t('optional')} />
                  </label>
                  <div className="group relative">
                    <span className={iconWrapClass}><Phone className={iconClass} /></span>
                    <input
                      {...register('phone', {
                        validate: (v) => !v || v.trim() === '' || /^[+\d][\d\s\-()]{5,20}$/.test(v) || 'phoneInvalid',
                      })}
                      type="tel"
                      id="phone"
                      autoComplete="off"
                      aria-invalid={!!errors.phone}
                      className={inputClass(!!errors.phone)}
                      placeholder={t('enterPhone')}
                      {...antiAutofill}
                    />
                  </div>
                  <FieldError message={errors.phone ? t(errors.phone.message as string) : undefined} />
                </div>

                {/* Birth date (optional) */}
                <div className="relative min-w-0">
                  <label htmlFor="birthDate" className={labelClass}>
                    {t('birthDate')}<OptionalBadge text={t('optional')} />
                  </label>
                  <div className="group relative">
                    <span className={iconWrapClass}><Calendar className={iconClass} /></span>
                    <input
                      {...register('birthDate')}
                      type="date"
                      id="birthDate"
                      autoComplete="off"
                      className={`${inputClass(false)} dark:[color-scheme:dark]`}
                    />
                  </div>
                </div>

                {/* Gender (optional): segmented control, still a single "gender" radio group */}
                <fieldset className="min-w-0 sm:col-span-2">
                  <legend className={`${labelClass} flex items-center`}>
                    <UserCircle className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {t('gender')}<OptionalBadge text={t('optional')} />
                  </legend>
                  <div className="grid grid-cols-4 gap-1 rounded-xl border border-gray-200 bg-gray-100/80 p-1 dark:border-white/10 dark:bg-white/5 sm-down:grid-cols-2">
                    {GENDER_OPTIONS.map(({ value, label }) => {
                      const selected = gender === value;
                      return (
                        <label key={value} className="relative cursor-pointer">
                          <input type="radio" value={value} {...register('gender')} className="peer sr-only" />
                          <span
                            className={[
                              'flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight',
                              'transition-all duration-200 active:scale-95 peer-focus-visible:ring-2 peer-focus-visible:ring-purple-400',
                              selected
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/40 ring-1 ring-white/30'
                                : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white',
                            ].join(' ')}
                          >
                            {selected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
                            {t(label)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Password */}
                <div className="relative min-w-0">
                  <label htmlFor="password" className={labelClass}>{t('password')}</label>
                  <div className="group relative">
                    <span className={iconWrapClass}><Lock className={iconClass} /></span>
                    <input
                      {...register('password', {
                        required: 'passwordRequired',
                        minLength: { value: 6, message: 'passwordMinLength' },
                        maxLength: { value: 100, message: 'passwordMaxLength' }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
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
                  {errors.password
                    ? <FieldError message={t(errors.password.message ?? '')} />
                    : <PasswordStrength password={password} />}
                </div>

                {/* Confirm password */}
                <div className="relative min-w-0">
                  <label htmlFor="confirmPassword" className={labelClass}>{t('confirmPassword')}</label>
                  <div className="group relative">
                    <span className={iconWrapClass}><Lock className={iconClass} /></span>
                    <input
                      {...register('confirmPassword', {
                        required: 'confirmPasswordRequired',
                        validate: (value) => value === password || 'passwordMismatch'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      className={inputClass(!!errors.confirmPassword, 'pr-16')}
                      placeholder={t('reenterPassword')}
                    />
                    {passwordsMatch && (
                      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-10 flex items-center text-emerald-500">
                        <CheckCircle2 className="h-[18px] w-[18px]" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={t('confirmPassword')}
                      aria-pressed={showConfirmPassword}
                      className={eyeButtonClass}
                    >
                      {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  {errors.confirmPassword ? (
                    <FieldError message={t(errors.confirmPassword.message ?? '')} />
                  ) : passwordsMatch ? (
                    <p className="absolute left-0 top-full flex items-center gap-1 pt-1.5 text-[11px] font-medium leading-none text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      {t('passwordMatch')}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Server / request error */}
              {error && (
                <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 dark:border-red-800/60 dark:bg-red-950/40">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300 md-down:text-xs">{t(error)}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="reg-submit group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-900 md-down:text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('creatingAccount')}
                  </>
                ) : (
                  <>
                    {t('createAccountBtn')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="reg-login mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              {t('hasAccount')}{' '}
              <Link
                to="/login"
                className="font-semibold text-purple-600 transition-colors duration-200 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                {t('loginNow')}
              </Link>
            </p>

            {/* Terms */}
            <p className="reg-terms mt-2.5 text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              {t('agreeTerms')}{' '}
              <a href="#" className="text-purple-600 hover:underline dark:text-purple-400">{t('termsOfService')}</a>
              {' '}{t('and')}{' '}
              <a href="#" className="text-purple-600 hover:underline dark:text-purple-400">{t('privacyPolicy')}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
