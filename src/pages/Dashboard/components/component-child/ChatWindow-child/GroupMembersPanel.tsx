import { useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { groupService } from '@/services/groupService';
import { chatService } from '@/services/chatService';
import { getSocket } from '@/services/socket';
import { toast } from 'react-hot-toast';
import { Key } from 'lucide-react';

interface GroupMemberInfo {
  id: number;
  name: string;
  avatar?: string | null;
  role: 'member'|'admin'|'owner';
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | 'unspecified';
  hidePhone?: boolean;
  hideBirthDate?: boolean;
}

interface GroupMembersPanelProps {
  open: boolean;
  groupId: number | null;
  onClose: () => void;
  onOpenProfile: (user: GroupMemberInfo) => void;
  isOwner?: boolean;
  currentUserId?: number;
}

const GroupMembersPanel = memo(function GroupMembersPanel({ open, groupId, onClose, onOpenProfile, isOwner = false, currentUserId }: GroupMembersPanelProps) {
  const { t } = useTranslation('dashboard');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<GroupMemberInfo[]>([]);
  // Friends status for rendering "Kết bạn" button
  const [friendsSet, setFriendsSet] = useState<Set<number>>(new Set());
  const [sentSet, setSentSet] = useState<Set<number>>(new Set());
  const [receivedSet, setReceivedSet] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let canceled = false;
    const fetchMembers = async () => {
      if (!open || !groupId) return;
      setLoading(true);
      try {
        const res = await groupService.getGroupMembers(groupId);
        if (!canceled) {
          const list: GroupMemberInfo[] = (res?.data || []).map((u: any) => ({
            id: Number(u.id),
            name: String(u.name || ''),
            avatar: u.avatar || null,
            role: u.role,
            email: u.email ?? null,
            phone: u.phone ?? null,
            birthDate: u.birthDate ?? null,
            gender: u.gender ?? 'unspecified',
            hidePhone: !!u.hidePhone,
            hideBirthDate: !!u.hideBirthDate,
          }));
          setMembers(list);
        }
      } catch (e: any) {
        if (!canceled) {
          toast.error(e?.response?.data?.message || String(t('chat.errors.generic')));
          setMembers([]);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetchMembers();
    return () => { canceled = true; };
  }, [open, groupId, t]);

  // Load friends and friend-requests to derive button states
  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        if (!open) { setFriendsSet(new Set()); setSentSet(new Set()); setReceivedSet(new Set()); return; }
        // Friends
        const friendsRes = await chatService.getFriends();
        if (!canceled && friendsRes?.success) {
          const s = new Set<number>((friendsRes.data || []).map((u: any) => Number(u.id)));
          setFriendsSet(s);
        }
        // Sent requests
        const sentRes = await chatService.getSentRequests();
        if (!canceled && sentRes?.success) {
          const s = new Set<number>((sentRes.data || []).map((r: any) => Number(r?.receiver?.id ?? r?.toUser?.id))); // backend variations
          setSentSet(s);
        }
        // Received requests
        const recvRes = await chatService.getFriendRequests();
        if (!canceled && recvRes?.success) {
          const s = new Set<number>((recvRes.data || []).map((r: any) => Number(r?.requester?.id ?? r?.fromUser?.id)));
          setReceivedSet(s);
        }
      } catch (_) {
        if (!canceled) {
          setFriendsSet(new Set());
          setSentSet(new Set());
          setReceivedSet(new Set());
        }
      }
    };
    load();
    return () => { canceled = true; };
  }, [open]);

  const handleSendFriendRequest = async (userId: number) => {
    try {
      setSending((prev) => ({ ...prev, [userId]: true }));
      const res = await chatService.sendFriendRequest(userId);
      if (res?.success) {
        toast.success(String(t('chat.success.sentFriendRequest', 'Đã gửi lời mời kết bạn')));
        setSentSet((prev) => new Set<number>([...Array.from(prev), Number(userId)]));
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || String(t('chat.errors.generic', 'Đã xảy ra lỗi')));
    } finally {
      setSending((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Realtime: listen for role updates while the panel is open
  useEffect(() => {
    if (!open || !groupId) return;
    const socket = getSocket();
    if (!socket) return;

    const onRoleUpdated = (payload: { groupId: number; userId: number; role: 'admin'|'member' }) => {
      try {
        if (!payload || Number(payload.groupId) !== Number(groupId)) return;
        setMembers((prev) => prev.map((m) => (m.id === Number(payload.userId) ? { ...m, role: payload.role } : m)));
      } catch (_e) {
        // ignore
      }
    };

    socket.on('group_member_role_updated', onRoleUpdated);
    return () => {
      socket.off('group_member_role_updated', onRoleUpdated);
    };
  }, [open, groupId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">{t('chat.groups.members.title', 'Thành viên nhóm')}</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            aria-label={t('actions.close', 'Close') as any}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">{t('loading', { defaultValue: 'Đang tải...' })}</div>
          ) : members.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">{t('chat.groups.members.empty', 'Chưa có thành viên')}</div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
              {members.map((m) => {
                const hasAddFriendButton = Number(m.id) !== Number(currentUserId) && !friendsSet.has(Number(m.id)) && !sentSet.has(Number(m.id)) && !receivedSet.has(Number(m.id));
                const hasRoleButtons = isOwner && m.role !== 'owner';
                
                // Only use complex layout for owners when they have role management buttons
                if (isOwner && hasRoleButtons) {
                  // Complex layout for owners (buttons on separate row)
                  return (
                    <li key={m.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex items-center gap-3 hover:opacity-90 min-w-0 flex-1"
                          onClick={() => onOpenProfile(m)}
                          title={t('chat.chatView.viewProfile', 'Xem thông tin') as any}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                              {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : (m.name || '').charAt(0)}
                            </div>
                            {m.role === 'owner' && (
                              <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-600 shadow-sm">
                                <Key className="w-2.5 h-2.5 text-amber-500" />
                              </span>
                            )}
                            {m.role === 'admin' && (
                              <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-sm">
                                <Key className="w-2.5 h-2.5 text-gray-500 dark:text-gray-300" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {m.name}
                          </div>
                        </button>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${m.role === 'owner' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : m.role === 'admin' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}>
                          {m.role === 'owner' ? t('chat.groups.roles.owner', 'Chủ nhóm') : m.role === 'admin' ? t('chat.groups.roles.admin', 'Quản trị') : t('chat.groups.roles.member', 'Thành viên')}
                        </span>
                      </div>
                      
                      {/* Action buttons row - separate from main content */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 ml-12">
                        {/* Add friend button */}
                        {hasAddFriendButton && (
                          <button
                            onClick={() => handleSendFriendRequest(Number(m.id))}
                            disabled={!!sending[m.id]}
                            className={`text-xs px-2 py-1 rounded-md border transition-colors ${sending[m.id] ? 'border-gray-300 text-gray-400 bg-gray-100 dark:border-gray-700 dark:text-gray-500 dark:bg-gray-800' : 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30'}`}
                            title={String(t('chat.actions.addFriend', { defaultValue: 'Kết bạn' } as any))}
                            aria-label={String(t('chat.actions.addFriend', { defaultValue: 'Kết bạn' } as any))}
                          >
                            {sending[m.id] ? String(t('common.sending', { defaultValue: 'Đang gửi...' } as any)) : String(t('chat.actions.addFriend', { defaultValue: 'Kết bạn' } as any))}
                          </button>
                        )}
                        
                        {/* Role management buttons for owners */}
                        {m.role === 'member' ? (
                          <button
                            className="text-xs px-2 py-1 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
                            onClick={async () => {
                              if (!groupId) return;
                              try {
                                await groupService.updateMemberRole(groupId, m.id, 'admin');
                                setMembers(prev => prev.map(x => x.id === m.id ? { ...x, role: 'admin' } : x));
                                toast.success(String(t('chat.groups.success.roleUpdated', { defaultValue: 'Đã cập nhật quyền' })));
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || String(t('chat.groups.errors.updateFailed')));
                              }
                            }}
                            title={String(t('chat.groups.actions.promoteToAdmin', { defaultValue: 'Thăng làm quản trị' }))}
                            aria-label={String(t('chat.groups.actions.promoteToAdmin', { defaultValue: 'Thăng làm quản trị' }))}
                          >
                            {t('chat.groups.actions.promoteToAdmin', 'Thăng làm quản trị')}
                          </button>
                        ) : (
                          <button
                            className="text-xs px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                            onClick={async () => {
                              if (!groupId) return;
                              try {
                                await groupService.updateMemberRole(groupId, m.id, 'member');
                                setMembers(prev => prev.map(x => x.id === m.id ? { ...x, role: 'member' } : x));
                                toast.success(String(t('chat.groups.success.roleUpdated', { defaultValue: 'Đã cập nhật quyền' })));
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || String(t('chat.groups.errors.updateFailed')));
                              }
                            }}
                            title={String(t('chat.groups.actions.demoteToMember', { defaultValue: 'Giáng làm thành viên' }))}
                            aria-label={String(t('chat.groups.actions.demoteToMember', { defaultValue: 'Giáng làm thành viên' }))}
                          >
                            {t('chat.groups.actions.demoteToMember', 'Giáng làm thành viên')}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                } else {
                  // Simple layout for non-owners or when no role buttons (original layout)
                  return (
                    <li key={m.id} className="flex items-center gap-3 p-3">
                      <button
                        type="button"
                        className="flex items-center gap-3 hover:opacity-90 min-w-0 flex-1"
                        onClick={() => onOpenProfile(m)}
                        title={t('chat.chatView.viewProfile', 'Xem thông tin') as any}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                            {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : (m.name || '').charAt(0)}
                          </div>
                          {m.role === 'owner' && (
                            <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-600 shadow-sm">
                              <Key className="w-2.5 h-2.5 text-amber-500" />
                            </span>
                          )}
                          {m.role === 'admin' && (
                            <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-sm">
                              <Key className="w-2.5 h-2.5 text-gray-500 dark:text-gray-300" />
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {m.name}
                        </div>
                      </button>
                      
                      <div className="ml-auto flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                        {/* Add friend button (only show if needed) */}
                        {hasAddFriendButton && (
                          <button
                            onClick={() => handleSendFriendRequest(Number(m.id))}
                            disabled={!!sending[m.id]}
                            className={`text-xs px-2 py-1 rounded-md border transition-colors ${sending[m.id] ? 'border-gray-300 text-gray-400 bg-gray-100 dark:border-gray-700 dark:text-gray-500 dark:bg-gray-800' : 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30'}`}
                            title={String(t('chat.actions.addFriend', { defaultValue: 'Kết bạn' } as any))}
                            aria-label={String(t('chat.actions.addFriend', { defaultValue: 'Kết bạn' } as any))}
                          >
                            {sending[m.id] ? String(t('common.sending', { defaultValue: 'Đang gửi...' } as any)) : String(t('chat.actions.addFriend', { defaultValue: 'Kết bạn' } as any))}
                          </button>
                        )}
                        
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${m.role === 'owner' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : m.role === 'admin' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}>
                          {m.role === 'owner' ? t('chat.groups.roles.owner', 'Chủ nhóm') : m.role === 'admin' ? t('chat.groups.roles.admin', 'Quản trị') : t('chat.groups.roles.member', 'Thành viên')}
                        </span>
                      </div>
                    </li>
                  );
                }
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

GroupMembersPanel.displayName = 'GroupMembersPanel';

export default GroupMembersPanel;


