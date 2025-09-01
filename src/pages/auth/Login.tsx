import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser, loginWithGoogle, loginWithFacebook } from '@/store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    google?: any;
    FB?: any;
  }
}

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Map GIS/FedCM reasons to user-friendly messages
  const reasonMessage = (reason: string) => {
    switch (reason) {
      case 'suppressed_by_user':
      case 'blocked_by_settings':
        return 'Trình duyệt đang chặn "Third‑party sign‑in" (FedCM). Hãy cho phép trong Site settings của localhost:5173.';
      case 'opt_out_or_no_session':
        return 'Bạn chưa đăng nhập Google trong trình duyệt, hoặc đã tắt One Tap. Hãy đăng nhập tại accounts.google.com rồi thử lại.';
      case 'browser_not_supported':
        return 'Trình duyệt hiện tại không hỗ trợ FedCM. Hãy cập nhật Chrome/Edge lên bản mới nhất.';
      case 'missing_client_id':
      case 'invalid_client':
        return 'Cấu hình Client ID không hợp lệ. Kiểm tra VITE_GOOGLE_CLIENT_ID/GOOGLE_CLIENT_ID.';
      case 'unregistered_origin':
      case 'origin_mismatch':
        return 'Origin không khớp. Thêm http://localhost:5173 vào Authorized JavaScript origins trong Google Cloud Console.';
      case 'secure_http_required':
        return 'Yêu cầu HTTPS trong bối cảnh hiện tại. Dùng localhost:5173 trong dev.';
      case 'user_cancel':
      case 'tap_outside':
      case 'auto_cancel':
        return 'Bạn đã đóng hoặc bỏ qua hộp thoại đăng nhập.';
      default:
        return `Không thể mở cửa sổ đăng nhập (lý do: ${reason}). Hãy kiểm tra cài đặt trình duyệt hoặc cấu hình OAuth.`;
    }
  };

  // Load Google Identity Services and initialize
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const render = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          handleGoogleResponse(response);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [dispatch, navigate, GOOGLE_CLIENT_ID]);

  // Load Facebook SDK and initialize
  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;

    const initFB = () => {
      if (!window.FB) return;

      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    if (window.FB) {
      initFB();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    script.async = true;
    script.defer = true;
    script.onload = initFB;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [FACEBOOK_APP_ID]);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Thiếu cấu hình VITE_GOOGLE_CLIENT_ID');
      return;
    }
    if (!window.google?.accounts?.id) {
      toast.error('Google Sign-In chưa sẵn sàng, vui lòng thử lại.');
      return;
    }
    // Ensure initialized (idempotent)
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        handleGoogleResponse(response);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    // Trigger One Tap / account chooser with diagnostics
    window.google.accounts.id.prompt((notification: any) => {
      const notDisplayed = notification?.getNotDisplayedReason?.();
      const dismissed = notification?.getDismissedReason?.();
      const skipped = notification?.getSkippedReason?.();

      if (notDisplayed) {
        // Common: blocked_by_settings, suppressed_by_user, origin_mismatch
        console.warn('GIS notDisplayed:', notDisplayed);
        toast.error(reasonMessage(notDisplayed));
      } else if (dismissed && dismissed !== 'credential_returned') {
        console.warn('GIS dismissed:', dismissed);
        toast.error(reasonMessage(dismissed));
      } else if (skipped) {
        console.warn('GIS skipped:', skipped);
        toast.error(reasonMessage(skipped));
      }
    });
  };

  const handleFacebookClick = () => {
    if (!FACEBOOK_APP_ID) {
      toast.error('Thiếu cấu hình VITE_FACEBOOK_APP_ID');
      return;
    }
    
    if (!window.FB) {
      toast.error('Facebook SDK chưa sẵn sàng, vui lòng thử lại.');
      return;
    }

    // Check if running on localhost with HTTP (development mode)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttp = window.location.protocol === 'http:';
    
    if (isHttp && !isLocalhost) {
      toast.error('Facebook login yêu cầu HTTPS. Vui lòng sử dụng HTTPS hoặc localhost.');
      return;
    }

    // Use FB.getLoginStatus for HTTP localhost development
    if (isHttp && isLocalhost) {
      window.FB.getLoginStatus((statusResponse: any) => {
        if (statusResponse.status === 'connected') {
          // User is already logged in
          handleFacebookResponse(statusResponse);
        } else {
          // Redirect to Facebook login page instead of popup for HTTP
          const redirectUrl = encodeURIComponent(window.location.origin + '/auth/facebook/callback');
          const facebookLoginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUrl}&scope=email&response_type=code`;
          
          toast.loading('Chuyển hướng đến trang đăng nhập Facebook...');
          window.location.href = facebookLoginUrl;
        }
      });
      return;
    }

    // Normal popup login for HTTPS
    window.FB.login((response: any) => {
      handleFacebookResponse(response);
    }, { scope: 'email' });
  };

  const handleGoogleResponse = async (response: any) => {
    const idToken = response?.credential;
    if (!idToken) return;
    const result = await dispatch(loginWithGoogle(idToken));
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleFacebookResponse = async (response: any) => {
    if (response.authResponse) {
      const accessToken = response.authResponse.accessToken;
      if (accessToken) {
        const result = await dispatch(loginWithFacebook(accessToken));
        if (loginWithFacebook.fulfilled.match(result)) {
          navigate('/dashboard');
        }
      }
    } else {
      toast.error('Đăng nhập Facebook bị hủy hoặc thất bại');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginUser(data));
    
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center px-4 py-12">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('welcomeBack')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('loginSubtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: t('emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('emailInvalid')
                    }
                  })}
                  type="email"
                  id="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('enterEmail')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
{t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: t('passwordRequired')
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder={t('enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
{t('rememberMe')}
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200">
{t('forgotPasswordLink')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
{t('loggingIn')}
                </div>
              ) : (
t('login')
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
{t('noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
              >
{t('signUpNow')}
              </Link>
            </p>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-500 dark:text-gray-400">{t('orLoginWith')}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white/50 text-sm font-medium text-gray-700 hover:bg-white/70 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookClick}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white/50 text-sm font-medium text-gray-500 hover:bg-white/70 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
