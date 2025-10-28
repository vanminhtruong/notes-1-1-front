import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { groupService } from '../../components/interface/chatWindowImports';
import type { GroupSummary } from '../../components/interface/chatWindowImports';

interface UseGroupActionsHandlerProps {
  selectedGroup: GroupSummary | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<GroupSummary | null>>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setShowRemoveMembers: React.Dispatch<React.SetStateAction<boolean>>;
  confirmWithToast: (message: string) => Promise<boolean>;
  t: any;
}

export const useGroupActionsHandler = ({
  selectedGroup,
  setSelectedGroup,
  setMessages,
  setShowRemoveMembers,
  confirmWithToast,
  t,
}: UseGroupActionsHandlerProps) => {
  const handleRemoveMembersConfirm = useCallback(async (memberIds: number[]) => {
    if (!selectedGroup) return;
    try {
      const res = await groupService.removeMembers(selectedGroup.id, memberIds);
      if (res.success) {
        toast.success(t('chat.groups.success.removed'));
        setShowRemoveMembers(false);
        setSelectedGroup((prev) => prev ? { ...prev, members: prev.members.filter((id) => !memberIds.includes(id)) } : prev);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('chat.groups.errors.removeFailed'));
    }
  }, [selectedGroup, setShowRemoveMembers, setSelectedGroup, t]);

  const handleLeaveGroup = useCallback(async () => {
    if (!selectedGroup) return;
    const ok = await confirmWithToast(String(t('chat.groups.confirm.leave')));
    if (!ok) return;
    try {
      const res = await groupService.leaveGroup(selectedGroup.id);
      if (res.success) {
        toast.success(t('chat.groups.success.left'));
        setSelectedGroup(null);
        setMessages([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('chat.errors.generic'));
    }
  }, [selectedGroup, confirmWithToast, setSelectedGroup, setMessages, t]);

  const handleDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return;
    const ok = await confirmWithToast(String(t('chat.groups.confirm.delete')));
    if (!ok) return;
    try {
      const res = await groupService.deleteGroup(selectedGroup.id);
      if (res.success) {
        setSelectedGroup(null);
        setMessages([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('chat.groups.errors.deleteFailed'));
    }
  }, [selectedGroup, confirmWithToast, setSelectedGroup, setMessages, t]);

  const handleGroupEditorSuccess = useCallback((g: GroupSummary) => {
    setSelectedGroup((prev) => (prev && prev.id === g.id ? g : prev));
  }, [setSelectedGroup]);

  return {
    handleRemoveMembersConfirm,
    handleLeaveGroup,
    handleDeleteGroup,
    handleGroupEditorSuccess,
  };
};
