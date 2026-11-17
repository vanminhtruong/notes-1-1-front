import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { registerUser } from '@/store/slices/authSlice';
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string | null;
  birthDate?: string | null; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'unspecified';
}


export function useRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterFormData>({ defaultValues: { gender: 'unspecified' } });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword'); const gender = watch('gender');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone && data.phone.trim() !== '' ? data.phone.trim() : null,
      birthDate: data.birthDate && data.birthDate !== '' ? data.birthDate : null,
      gender: (data.gender as RegisterFormData['gender']) || 'unspecified',
    };

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      reset();
      navigate('/login');
    }
  };

  return { showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    isLoading, error, register, handleSubmit, errors, password, confirmPassword, gender, onSubmit };
}
