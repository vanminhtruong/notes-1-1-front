import { useCallback } from 'react';

interface UseDashboardModalsHandlerProps {
  setShowViewModal: (value: boolean) => void;
  setShowEditModal: (value: boolean) => void;
  setShowCreateModal: (value: boolean) => void;
}

export const useDashboardModalsHandler = ({
  setShowViewModal,
  setShowEditModal,
  setShowCreateModal,
}: UseDashboardModalsHandlerProps) => {
  const handleShareSuccess = useCallback(() => {
    setShowViewModal(false);
  }, [setShowViewModal]);

  const handleCloseCreateModal = useCallback(() => setShowCreateModal(false), [setShowCreateModal]);
  const handleOpenCreateModal = useCallback(() => setShowCreateModal(true), [setShowCreateModal]);
  const handleCloseViewModal = useCallback(() => setShowViewModal(false), [setShowViewModal]);
  const handleCloseEditModal = useCallback(() => setShowEditModal(false), [setShowEditModal]);

  return {
    handleShareSuccess,
    handleCloseCreateModal,
    handleOpenCreateModal,
    handleCloseViewModal,
    handleCloseEditModal,
  };
};
