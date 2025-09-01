import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { Mail, KeyRound, Lock, ShieldCheck } from 'lucide-react';

type Step = 'email' | 'otp' | 'reset';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<{ email: string }>();
  const otpForm = useForm<{ otp: string }>();
  const resetForm = useForm<{ newPassword: string; confirmPassword: string }>();

  const submitEmail = emailForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      await authService.requestPasswordReset(data.email);
      setEmail(data.email);
      toast.success('Nếu email tồn tại, mã OTP đã được gửi.');
      setStep('otp');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  });

  const submitOtp = otpForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      await authService.verifyOtp({ email, otp: data.otp });
      setOtp(data.otp);
      toast.success('Xác thực OTP thành công');
      setStep('reset');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'OTP không hợp lệ.');
    } finally {
      setLoading(false);
    }
  });

  const submitReset = resetForm.handleSubmit(async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setLoading(true);
      await authService.resetPassword({ email, otp, newPassword: data.newPassword });
      toast.success('Đặt lại mật khẩu thành công');
      setTimeout(() => navigate('/login'), 800);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quên mật khẩu</h1>
          <p className="text-gray-600 dark:text-gray-300">Làm theo các bước để đặt lại mật khẩu của bạn</p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-8">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${step !== 'email' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step !== 'email' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>1</div>
              <span className="text-sm">Email</span>
            </div>
            <div className={`flex-1 mx-2 h-0.5 ${step === 'email' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500'}`}></div>
            <div className={`flex items-center ${step === 'reset' ? 'text-blue-600' : step === 'otp' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step === 'reset' || step === 'otp' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>2</div>
              <span className="text-sm">OTP</span>
            </div>
            <div className={`flex-1 mx-2 h-0.5 ${step === 'reset' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step === 'reset' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step === 'reset' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>3</div>
              <span className="text-sm">Mật khẩu mới</span>
            </div>
          </div>

          {step === 'email' && (
            <form onSubmit={submitEmail} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...emailForm.register('email', {
                      required: 'Email là bắt buộc',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email không hợp lệ' },
                    })}
                    type="email"
                    id="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Nhập email đã đăng ký"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {loading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={submitOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nhập mã OTP (6 số)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...otpForm.register('otp', {
                      required: 'OTP là bắt buộc',
                      pattern: { value: /^\d{6}$/, message: 'OTP phải gồm 6 chữ số' },
                    })}
                    inputMode="numeric"
                    maxLength={6}
                    id="otp"
                    className="block w-full pl-10 pr-3 py-3 tracking-widest uppercase border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="••••••"
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">Đã gửi đến: <span className="font-medium">{email}</span></p>
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('email')} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Quay lại</button>
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={submitReset} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...resetForm.register('newPassword', { required: 'Mật khẩu mới là bắt buộc', minLength: { value: 6, message: 'Ít nhất 6 ký tự' } })}
                    type="password"
                    id="newPassword"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Xác nhận mật khẩu</label>
                <input
                  {...resetForm.register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu' })}
                  type="password"
                  id="confirmPassword"
                  className="block w-full py-3 px-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Nhập lại mật khẩu mới"
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep('otp')} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Quay lại</button>
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-5 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
