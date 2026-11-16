import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { changePassword } from '@/services/authService'

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useChangePasswordForm() {
  const { t } = useTranslation(['dashboard', 'layout'])
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('auth.changePassword.errors.passwordMismatch'))
      return
    }

    setIsLoading(true)
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      
      toast.success(t('auth.changePassword.success'))
      reset()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('auth.changePassword.errors.updateFailed')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return { register, handleSubmit, errors, newPassword, onSubmit, isLoading,
    showCurrentPassword, setShowCurrentPassword, showNewPassword, setShowNewPassword,
    showConfirmPassword, setShowConfirmPassword }
}
