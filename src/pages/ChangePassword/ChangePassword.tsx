import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { changePassword } from '@/services/authService'
import LazyLoad from '@/components/LazyLoad'

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePassword() {
  const { t } = useTranslation(['dashboard', 'layout'])
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('auth.changePassword.errors.passwordMismatch'))
      return
    }

    setIsLoading(true)
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      
      toast.success(t('auth.changePassword.success'))
      reset()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('auth.changePassword.errors.updateFailed')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 lg-down:gap-3 lg-down:mb-7 md-down:gap-2.5 md-down:mb-6 sm-down:gap-2 sm-down:mb-5 xs-down:mb-4">
          <Link
            to="/account"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors sm-down:gap-1.5"
          >
            <ChevronLeft className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
            <span className="lg-down:text-sm sm-down:text-xs">{t('layout:user.accountDetails')}</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl p-8 lg-down:rounded-xl lg-down:p-7 md-down:rounded-lg md-down:p-6 sm-down:p-5 xs-down:p-4">
            {/* Title */}
            <div className="text-center mb-8 lg-down:mb-7 md-down:mb-6 sm-down:mb-5 xs-down:mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 lg-down:w-14 lg-down:h-14 md-down:w-12 md-down:h-12 sm-down:mb-3">
                <Lock className="w-8 h-8 text-white lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg-down:text-xl md-down:text-lg sm-down:text-base">
                {t('auth.changePassword.title')}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg-down:space-y-5 md-down:space-y-4 sm-down:space-y-3.5 xs-down:space-y-3">
              {/* Current Password */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0} reAnimate={true}>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                  {t('auth.changePassword.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('currentPassword', {
                      required: t('auth.changePassword.errors.currentRequired'),
                    })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors sm-down:right-2.5"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    ) : (
                      <Eye className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 md-down:text-xs">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              </LazyLoad>

              {/* New Password */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100} reAnimate={true}>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                  {t('auth.changePassword.newPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('newPassword', {
                      required: t('auth.changePassword.errors.newRequired'),
                      minLength: {
                        value: 6,
                        message: t('auth.changePassword.errors.minLength'),
                      },
                    })}
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors sm-down:right-2.5"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    ) : (
                      <Eye className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 md-down:text-xs">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              </LazyLoad>

              {/* Confirm Password */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200} reAnimate={true}>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                  {t('auth.changePassword.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: t('auth.changePassword.errors.confirmRequired'),
                      validate: (value) =>
                        value === newPassword || t('auth.changePassword.errors.passwordMismatch'),
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors sm-down:right-2.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    ) : (
                      <Eye className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 md-down:text-xs">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              </LazyLoad>

              {/* Submit Button */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300} reAnimate={true}>
                <div className="flex gap-3 pt-4 lg-down:gap-2.5 md-down:pt-3 sm-down:gap-2 xs-down:pt-2.5">
                <Link
                  to="/account"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                >
                  {t('auth.changePassword.cancel')}
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 sm-down:gap-1.5">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin lg-down:w-3.5 lg-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                      <span>{t('auth.changePassword.submit')}</span>
                    </div>
                  ) : (
                    t('auth.changePassword.submit')
                  )}
                </button>
              </div>
              </LazyLoad>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
