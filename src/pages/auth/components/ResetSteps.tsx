import { useTranslation } from 'react-i18next';

type Step = 'email' | 'otp' | 'reset';
export default function ResetSteps({ step }: { step: Step }) {
  const { t } = useTranslation('auth');
  return (
    <>
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8 xs-down:mb-6">
            <div className={`flex items-center ${step !== 'email' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 xs-down:w-7 xs-down:h-7 rounded-full flex items-center justify-center mr-2 ${step !== 'email' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>1</div>
              <span className="text-sm xs-down:text-xs">{t('stepEmail')}</span>
            </div>
            <div className={`flex-1 mx-2 h-0.5 ${step === 'email' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500'}`}></div>
            <div className={`flex items-center ${step === 'reset' ? 'text-blue-600' : step === 'otp' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 xs-down:w-7 xs-down:h-7 rounded-full flex items-center justify-center mr-2 ${step === 'reset' || step === 'otp' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>2</div>
              <span className="text-sm xs-down:text-xs">{t('stepOtp')}</span>
            </div>
            <div className={`flex-1 mx-2 h-0.5 ${step === 'reset' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'reset' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 xs-down:w-7 xs-down:h-7 rounded-full flex items-center justify-center mr-2 ${step === 'reset' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>3</div>
              <span className="text-sm xs-down:text-xs">{t('stepNewPassword')}</span>
            </div>
          </div>

    </>
  );
}
