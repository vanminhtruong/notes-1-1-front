import { useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

interface GoogleSignInModalProps {
  clientId: string;
  onSuccess: (credential: string) => void;
  onClose: () => void;
}

const GoogleSignInModal = memo(({ clientId, onSuccess, onClose }: GoogleSignInModalProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when modal is mounted
  useEffect(() => {
    lockBodyScroll('GoogleSignInModal');
    return () => {
      unlockBodyScroll('GoogleSignInModal');
    };
  }, []);

  useEffect(() => {
    if (!window.google?.accounts?.id || !buttonRef.current) return;

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response?.credential) {
          onSuccess(response.credential);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });

    // Render Google button
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      width: 320,
      shape: 'rectangular',
    });
  }, [clientId, onSuccess]);

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 min-w-[400px] relative border border-gray-200 dark:border-gray-700">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đăng nhập với Google
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chọn tài khoản Google để tiếp tục
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <div ref={buttonRef} />
          </div>

          {/* Divider */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi
            </p>
          </div>
        </div>
      </div>
    </>
  );
});

GoogleSignInModal.displayName = 'GoogleSignInModal';

export default GoogleSignInModal;
