import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { authService } from '@/services/authService';
import { loginUser, loginWithGoogle } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    google?: any;
  }
}

interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export function useLoginForm() {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const getRememberFromCookie = () => {
    try {
      const m = document.cookie.match(/(?:^|; )remember_ui=([^;]+)/);
      return m ? decodeURIComponent(m[1]) === '1' : false;
    } catch {
      return false;
    }
  };

  const getEmailFromCookie = () => {
    try {
      const m = document.cookie.match(/(?:^|; )last_email=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch {
      return '';
    }
  };

  const getPasswordFromCookie = () => {
    try {
      const m = document.cookie.match(/(?:^|; )last_password=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch {
      return '';
    }
  };

  const {
    register,
    handleSubmit,
    setValue, watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { 
      email: getRememberFromCookie() ? getEmailFromCookie() : '', 
      password: getRememberFromCookie() ? getPasswordFromCookie() : '',
      remember: getRememberFromCookie() 
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // On mount, if email cookie exists, sync remember from backend
  useEffect(() => {
    const email = getEmailFromCookie();
    if (!email) return;
    (async () => {
      try {
        const { remember } = await authService.getRememberPref(email);
        setValue('remember', !!remember, { shouldDirty: true });
      } catch {}
    })();
  }, []);


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


  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error(t('errors.googleClientIdMissing'));
      return;
    }
    if (!window.google?.accounts?.id) {
      toast.error(t('errors.googleNotReady'));
      return;
    }
    setShowGoogleModal(true);
  };

  const handleGoogleSuccess = async (credential: string) => {
    setShowGoogleModal(false);
    await handleGoogleResponse({ credential });
  };


  const handleGoogleResponse = async (response: any) => {
    const idToken = response?.credential;
    if (!idToken) return;
    const result = await dispatch(loginWithGoogle(idToken));
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };


  const onSubmit = async (data: LoginFormData) => {
    // Save credentials to cookies if remember is checked
    if (data.remember) {
      document.cookie = `last_email=${encodeURIComponent(data.email)}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Strict`;
      document.cookie = `last_password=${encodeURIComponent(data.password)}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Strict`;
      document.cookie = `remember_ui=1; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Strict`;
    } else {
      // Clear cookies if remember is unchecked
      document.cookie = 'last_email=; max-age=0; path=/; SameSite=Strict';
      document.cookie = 'last_password=; max-age=0; path=/; SameSite=Strict';
      document.cookie = 'remember_ui=; max-age=0; path=/; SameSite=Strict';
    }

    const result = await dispatch(loginUser(data));
    
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return { showPassword, setShowPassword, showGoogleModal, setShowGoogleModal,
    isLoading, error, register, handleSubmit, errors, handleGoogleClick,
    handleGoogleSuccess, onSubmit, GOOGLE_CLIENT_ID, setValue, remember: watch('remember') };
}
