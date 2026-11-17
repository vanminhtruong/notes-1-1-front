import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type Step = 'email' | 'otp' | 'reset';

export function useForgotPasswordFlow() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [step, setStep] = useState<Step>('email');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState<{ type: 'email' | 'phone'; value: string }>({ type: 'email', value: '' });
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneLookupError, setPhoneLookupError] = useState(false);

  const emailForm = useForm<{ email?: string; phone?: string }>();
  const otpForm = useForm<{ otp: string }>();
  const resetForm = useForm<{ newPassword: string; confirmPassword: string }>();

  const submitIdentifier = emailForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      setPhoneLookupError(false);
      setResetToken('');
      emailForm.clearErrors('phone');
      if (method === 'email') {
        const email = String(data.email || '').trim().toLowerCase();
        await authService.requestPasswordReset({ email });
        setIdentifier({ type: 'email', value: email });
      } else {
        const phone = String(data.phone || '').trim();
        await authService.requestPasswordReset({ phone });
        setIdentifier({ type: 'phone', value: phone });
      }
      toast.success(t(method === 'phone' ? 'toastPhoneOtpSent' : 'toastRequestGeneric'));
      setStep('otp');
    } catch (e: any) {
      if (method === 'phone' && (e?.response?.data?.code === 'PHONE_NOT_REGISTERED' || e?.response?.status === 404)) {
        setPhoneLookupError(true);
        emailForm.setError('phone', { type: 'server', message: t('phoneNotRegistered') });
      } else {
        const code = e?.response?.data?.code;
        const errorKey = code === 'EMAIL_NOT_CONFIGURED' ? 'toastEmailNotConfigured'
          : code === 'EMAIL_UNAVAILABLE' ? 'toastEmailUnavailable'
          : method === 'email' && !e?.response && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') ? 'toastBackendOffline'
          : method === 'email' && e?.response?.status === 503 ? 'toastEmailUnavailable'
          : code === 'SMS_GATEWAY_NOT_READY' ? 'toastSmsGatewayNotReady'
          : code === 'SMS_KEY_REJECTED' ? 'toastSmsKeyRejected'
          : code === 'SMS_QUOTA_EXCEEDED' ? 'toastSmsQuotaExceeded'
          : code === 'SMS_NOT_CONFIGURED' ? 'toastSmsNotConfigured'
          : (method === 'phone' && !e?.response && typeof window !== 'undefined' && window.location.hostname.endsWith('github.io'))
            ? 'toastBackendOffline'
          : e?.response?.status === 503 ? 'toastSmsUnavailable' : 'toastSendOtpFailed';
        toast.error(t(errorKey));
      }
    } finally {
      setLoading(false);
    }
  });

  const submitOtp = otpForm.handleSubmit(async (data) => {
    try {
      setLoading(true);
      const verification = await authService.verifyOtp(
        identifier.type === 'email'
          ? { email: identifier.value, otp: data.otp }
          : { phone: identifier.value, otp: data.otp }
      );
      if (identifier.type === 'phone' && !verification.resetToken) {
        throw new Error('Missing reset token');
      }
      setResetToken(verification.resetToken || '');
      setOtp(data.otp);
      toast.success(t('toastOtpVerified'));
      setStep('reset');
    } catch (e: any) {
      toast.error(t('toastOtpInvalid'));
    } finally {
      setLoading(false);
    }
  });

  const submitReset = resetForm.handleSubmit(async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('toastPasswordsMismatch'));
      return;
    }
    try {
      setLoading(true);
      await authService.resetPassword(
        identifier.type === 'email'
          ? { email: identifier.value, otp, newPassword: data.newPassword }
          : { phone: identifier.value, otp, resetToken, newPassword: data.newPassword }
      );
      toast.success(t('toastResetSuccess'));
      setTimeout(() => navigate('/login'), 800);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('toastResetFailed'));
    } finally {
      setLoading(false);
    }
  });

  return { step, method, setMethod, identifier, setStep, loading, phoneLookupError, emailForm, otpForm, resetForm,
    submitIdentifier, submitOtp, submitReset };
}
