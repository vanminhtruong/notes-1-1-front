import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProfile } from '@/store/slices/authSlice';
import { authService, type User } from '@/services/authService';

type PrivateAccount = Pick<User, 'email' | 'birthDate' | 'gender'>;

export function useAccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  // Sensitive fields only live in this mounted account page, never in Redux/localStorage.
  const [phone, setPhone] = useState<string | null>(null);
  const [privateAccount, setPrivateAccount] = useState<PrivateAccount | null>(null);

  const refreshPhone = useCallback(() => {
    if (!isAuthenticated) return;
    void authService.getProfilePhone()
      .then((result) => setPhone(result.phone ?? null))
      .catch(() => setPhone(null));
  }, [isAuthenticated]);

  const refreshPrivateAccount = useCallback(() => {
    if (!isAuthenticated) return;
    void authService.getPrivateProfile()
      .then((result) => setPrivateAccount(result.profile))
      .catch(() => setPrivateAccount(null));
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !user) dispatch(getProfile());
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPhone(null);
      setPrivateAccount(null);
      return;
    }
    refreshPhone();
    refreshPrivateAccount();
    return () => {
      setPhone(null);
      setPrivateAccount(null);
    };
  }, [isAuthenticated, user?.id, refreshPhone, refreshPrivateAccount]);

  const onProfileSaved = useCallback(() => {
    refreshPhone();
    refreshPrivateAccount();
  }, [refreshPhone, refreshPrivateAccount]);

  return { navigate, user, phone, privateAccount, onProfileSaved, previewOpen, setPreviewOpen, editOpen, setEditOpen };
}
