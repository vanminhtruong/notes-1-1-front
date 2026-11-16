import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import ChangePasswordForm from './ChangePasswordForm'

export default function ChangePasswordContent() {
  const { t } = useTranslation(['dashboard', 'layout'])
  return (
    <>
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

            <ChangePasswordForm />
          </div>
        </div>
    </>
  )
}
