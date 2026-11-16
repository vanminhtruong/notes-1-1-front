import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProfile } from '@/store/slices/authSlice';

export function useAccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  

  return { navigate, user, previewOpen, setPreviewOpen, editOpen, setEditOpen };
}
