/**
 * useConfirmationToast Hook
 * Tạo confirmation dialog bằng toast
 * Theo kiến trúc Hybrid Architecture
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseConfirmationToastParams {
  t: (key: string, defaultValue?: string) => string;
}

interface UseConfirmationToastReturn {
  confirmWithToast: (message: string) => Promise<boolean>;
}

export const useConfirmationToast = ({
  t,
}: UseConfirmationToastParams): UseConfirmationToastReturn => {

  const confirmWithToast = useCallback((message: string) => new Promise<boolean>((resolve) => {
    const id = toast.custom((toastObj) => (
      <div className={`max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 ${toastObj.visible ? 'animate-in fade-in zoom-in' : 'animate-out fade-out zoom-out'}`}>
        <div className="text-sm text-gray-800 dark:text-gray-100 mb-3">{message}</div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { toast.dismiss(id); resolve(false); }}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
          >
            {t('actions.cancel', 'Cancel')}
          </button>
          <button
            onClick={() => { toast.dismiss(id); resolve(true); }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
          >
            {t('actions.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  }), [t]);

  return {
    confirmWithToast,
  };
};
