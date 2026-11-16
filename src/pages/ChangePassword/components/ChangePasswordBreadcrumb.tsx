import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'

export default function ChangePasswordBreadcrumb() {
  const { t } = useTranslation(['dashboard', 'layout'])
  return (
    <>
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

    </>
  )
}
