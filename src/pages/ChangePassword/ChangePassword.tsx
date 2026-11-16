import ChangePasswordBreadcrumb from './components/ChangePasswordBreadcrumb'
import ChangePasswordContent from './components/ChangePasswordContent'

export default function ChangePassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 xl-down:py-7 lg-down:py-6 md-down:py-5 sm-down:py-4 xs-down:py-3 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2">
        <ChangePasswordBreadcrumb />
        <ChangePasswordContent />
      </div>
    </div>
  )
}
