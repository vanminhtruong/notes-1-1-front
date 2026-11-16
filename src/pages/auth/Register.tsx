import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, UserCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import RegisterHeader from './components/RegisterHeader';
import { useRegisterForm } from './hooks/useRegisterForm';

const Register = () => {
  const { t } = useTranslation('auth');
  const { showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    isLoading, error, register, handleSubmit, errors, password, onSubmit } = useRegisterForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center px-4 py-12 xl-down:py-10 lg-down:py-9 md-down:py-8 sm-down:py-6 xs-down:py-5 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2 relative">
      {/* Auth controls: select language before signing in, without leaving the page. */}
      <div className="fixed top-4 right-4 z-50 flex items-start gap-2 lg-down:top-3 lg-down:right-3 md-down:top-2.5 md-down:right-2.5 sm-down:top-2 sm-down:right-2">
        <LanguageSwitcher inlineSubmenu />
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full relative z-[1]">
        <RegisterHeader />

        {/* Registration Form */}
        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8 xl-down:p-7 lg-down:p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg-down:space-y-5 md-down:space-y-4 sm-down:space-y-3.5 xs-down:space-y-3">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                {t('fullName')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <User className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <input
                  {...register('name', {
                    required: 'nameRequired',
                    minLength: { value: 2, message: 'nameMinLength' },
                    maxLength: { value: 50, message: 'nameMaxLength' }
                  })}
                  type="text"
                  id="name"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm xs-down:text-xs"
                  placeholder={t('enterName')}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 md-down:text-xs">{t(errors.name.message ?? '')}</p>
              )}
            </div>

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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm xs-down:text-xs"
                  placeholder={t('enterEmail')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 md-down:text-xs">{t(errors.email.message ?? '')}</p>
              )}
            </div>

            {/* Phone Field (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                {t('phone')} <span className="text-gray-400">({t('optional')})</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <Phone className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <input
                  {...register('phone', {
                    validate: (v) => !v || v.trim() === '' || /^[+\d][\d\s\-()]{5,20}$/.test(v) || 'phoneInvalid',
                  })}
                  type="tel"
                  id="phone"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm xs-down:text-xs"
                  placeholder={t('enterPhone')}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 md-down:text-xs">{t(errors.phone.message as string)}</p>
              )}
            </div>

            {/* Birth Date Field (optional) */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                {t('birthDate')} <span className="text-gray-400">({t('optional')})</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <Calendar className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <input
                  {...register('birthDate')}
                  type="date"
                  id="birthDate"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm xs-down:text-xs"
                />
              </div>
            </div>

            {/* Gender Field (optional) */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                {t('gender')} <span className="text-gray-400">({t('optional')})</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <UserCircle className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <select
                  {...register('gender')}
                  id="gender"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white lg-down:pl-9 lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm xs-down:text-xs"
                  defaultValue="unspecified"
                >
                  <option value="unspecified">{t('genderUnspecified')}</option>
                  <option value="male">{t('genderMale')}</option>
                  <option value="female">{t('genderFemale')}</option>
                  <option value="other">{t('genderOther')}</option>
                </select>
              </div>
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
                    required: 'passwordRequired',
                    minLength: { value: 6, message: 'passwordMinLength' },
                    maxLength: { value: 100, message: 'passwordMaxLength' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 lg-down:pr-10 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm sm-down:pr-9 xs-down:text-xs"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
{t('confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none lg-down:pl-2.5 sm-down:pl-2">
                  <Lock className="h-5 w-5 text-gray-400 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'confirmPasswordRequired',
                    validate: (value) => value === password || 'passwordMismatch'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 lg-down:pl-9 lg-down:py-2.5 lg-down:pr-10 md-down:py-2.5 md-down:text-sm sm-down:pl-8 sm-down:py-2 sm-down:text-sm sm-down:pr-9 xs-down:text-xs"
                  placeholder={t('reenterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center lg-down:pr-2.5 sm-down:pr-2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 lg-down:h-4 lg-down:w-4 sm-down:h-3.5 sm-down:w-3.5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 md-down:text-xs">{t(errors.confirmPassword.message ?? '')}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] lg-down:py-2.5 md-down:py-2.5 md-down:text-sm sm-down:py-2 xs-down:text-xs"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm-down:w-4 sm-down:h-4 sm-down:mr-1.5 xs-down:w-3.5 xs-down:h-3.5"></div>
                    {t('creatingAccount')}
                </div>
              ) : (
                t('createAccountBtn')
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50/90 p-4 transition-colors duration-200 dark:border-red-800/60 dark:bg-red-950/40 lg-down:p-3.5 md-down:p-3 sm-down:p-2.5">
                <p className="text-sm text-red-700 dark:text-red-300 md-down:text-xs">{t(error)}</p>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center lg-down:mt-5 md-down:mt-4 sm-down:mt-3.5">
            <p className="text-sm text-gray-600 dark:text-gray-300 md-down:text-xs">
{t('hasAccount')}{' '}
              <Link
                to="/login"
                className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors duration-200"
              >
{t('loginNow')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 lg-down:mt-7 md-down:mt-6 sm-down:mt-5 xs-down:mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 lg-down:text-sm md-down:text-xs sm-down:text-xs">
{t('agreeTerms')}{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">{t('termsOfService')}</a>
            {' '}{t('and')}{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">{t('privacyPolicy')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

