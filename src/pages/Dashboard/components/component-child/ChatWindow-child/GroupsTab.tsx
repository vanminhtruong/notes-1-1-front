import { useTranslation } from 'react-i18next';
import { useEffect, useState, memo } from 'react';
import React from 'react';
import { groupService } from '../../../../../services/groupService';
import { getSocket } from '../../../../../services/socket';
import { chatService } from '../../../../../services/chatService';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../../../../store';
import GroupEditorModal from './GroupEditorModal';
import { pinService } from '../../../../../services/pinService';
import { MoreVertical, Pin, PinOff, Search, X } from 'lucide-react';
import type { GroupsTabProps, GroupItem, PendingInvite } from '../../interface/ChatUI.interface';
import LazyLoad from '@/components/LazyLoad';
import InviteMembersModal from './InviteMembersModal';

const GroupsTab = memo(({ onSelectGroup }: GroupsTabProps) => {
  const { t } = useTranslation('dashboard');
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [pinStatusMap, setPinStatusMap] = useState<Record<number, boolean>>({});
  const [loadingPinFor, setLoadingPinFor] = useState<number | null>(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  // Override map to force unreadCount display (e.g., set to 0 immediately after read)
  const [unreadOverride, setUnreadOverride] = useState<Record<number, number | undefined>>({});

  const loadGroups = async (search?: string) => {
    setLoading(true);
    try {
      console.log('[GroupsTab] Loading groups...', { search });
      const res = await groupService.listMyGroups(search);
      if (res.success) {
        console.log('[GroupsTab] Groups loaded:', res.data);
        const data = (res.data || []).map((g: any) => {
          const ov = unreadOverride[g.id];
          return ov !== undefined ? { ...g, unreadCount: ov } : g;
        });
        setGroups(data);
        // Initialize pin status map from server (supports either isPinned or pinned flags)
        const initialPins: Record<number, boolean> = {};
        for (const g of data) {
          initialPins[g.id] = !!((g as any).isPinned || (g as any).pinned);
        }
        setPinStatusMap(initialPins);
      }
    } catch (e) {
      console.error('[GroupsTab] Failed to load groups:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const res = await groupService.getMyInvites();
      if (res.success) setPendingInvites(res.data || []);
    } catch (e) {
      console.error('Failed to load pending invites:', e);
    }
  };

  useEffect(() => {
    loadGroups(groupSearchTerm);
    loadPendingInvites();
  }, [groupSearchTerm]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onGroupCreated = () => loadGroups(groupSearchTerm);
    const onGroupInvited = () => {
      // Refresh pending invites when new invitation received
      loadPendingInvites();
      toast(t('chat.groups.notifications.newInvite', 'You have a new group invitation'));
    };
    const onMembersAdded = (payload: any) => {
      console.log('[Socket] group_members_added received:', payload);
      loadGroups(groupSearchTerm);
    };
    const onMemberLeft = () => loadGroups(groupSearchTerm);
    const onGroupLeft = () => loadGroups(groupSearchTerm);
    const onGroupUpdated = () => loadGroups(groupSearchTerm);
    // When any group message is marked read, refresh if it's me (to drop badge)
    const onGroupMessageRead = (payload: { groupId: number; userId: number; messageId: number; readAt: string }) => {
      try {
        if (!payload) return;
        if (Number(payload.userId) === Number(currentUserId)) {
          const gid = Number(payload.groupId);
          // Optimistically zero for this group without full reload
          setGroups((prev) => prev.map((g) => (g.id === gid ? ({ ...g, unreadCount: 0 }) : g)));
          setUnreadOverride((prev) => ({ ...prev, [gid]: 0 }));
        }
      } catch {}
    };

    socket.on('group_created', onGroupCreated);
    socket.on('group_invited', onGroupInvited);
    socket.on('group_members_added', onMembersAdded);
    socket.on('group_member_left', onMemberLeft);
    socket.on('group_left', onGroupLeft);
    socket.on('group_updated', onGroupUpdated);
    socket.on('group_message_read', onGroupMessageRead);
    // Realtime: refresh unread badges when a new message arrives in any group
    const onGroupMessage = (payload: any) => {
      try {
        if (!payload || typeof payload.groupId === 'undefined') return;
        const gid = Number(payload.groupId);
        // Nếu vừa đọc xong và đang force 0, thì tăng từ 0 → 1; ngược lại bỏ override để dùng số server
        setUnreadOverride((prev) => {
          const next = { ...prev } as Record<number, number | undefined>;
          if (next[gid] !== undefined) {
            next[gid] = Number(next[gid] || 0) + 1;
          } else {
            delete next[gid];
          }
          return next;
        });
        // Avoid full reload to prevent flicker; rely on override for badge display
        // Optionally, we could optimistically bump local unreadCount as well
        setGroups((prev) => prev.map((g) => (
          g.id === gid
            ? { ...g, unreadCount: (typeof unreadOverride[gid] === 'number' ? (unreadOverride[gid] as number) : (g.unreadCount || 0)) + 1 }
            : g
        )));
      } catch {}
    };
    socket.on('group_message', onGroupMessage);

    return () => {
      socket.off('group_created', onGroupCreated);
      socket.off('group_invited', onGroupInvited);
      socket.off('group_members_added', onMembersAdded);
      socket.off('group_member_left', onMemberLeft);
      socket.off('group_left', onGroupLeft);
      socket.off('group_updated', onGroupUpdated);
      socket.off('group_message_read', onGroupMessageRead);
      socket.off('group_message', onGroupMessage);
    };
  }, [groupSearchTerm]);

  // Listen for cross-component event when a group is opened/read to refresh unread badges
  useEffect(() => {
    const onMarkedRead = (e: any) => {
      try {
        const gid = Number(e?.detail?.groupId);
        if (Number.isFinite(gid) && gid > 0) {
          // Optimistically zero the badge for this group
          setGroups((prev) => prev.map((g) => (g.id === gid ? ({ ...g, unreadCount: 0 }) : g)));
          setUnreadOverride((prev) => ({ ...prev, [gid]: 0 }));
        }
        // Then fetch authoritative data from backend
        loadGroups(groupSearchTerm);
      } catch {
        loadGroups(groupSearchTerm);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('group_marked_read', onMarkedRead as any);
      return () => window.removeEventListener('group_marked_read', onMarkedRead as any);
    }
  }, [groupSearchTerm]);

  // Load available users for inviting (filters out current group members)
  const loadAvailableUsers = async (search = '') => {
    setLoadingUsers(true);
    try {
      console.log('Loading users for invite modal...', { search });
      
      let users: any[] = [];
      
      try {
        // Try method 1: Use chatService.getUsers
        const usersResponse = await chatService.getUsers(search);
        console.log('Method 1 - Users response:', usersResponse);
        
        if (usersResponse && usersResponse.success && usersResponse.data) {
          users = usersResponse.data;
        }
      } catch (error1) {
        console.log('Method 1 failed, trying method 2:', error1);
        
        try {
          // Method 2: Try getting friends first as fallback
          const friendsResponse = await chatService.getFriends();
          console.log('Method 2 - Friends response:', friendsResponse);
          
          if (friendsResponse && friendsResponse.success && friendsResponse.data) {
            users = friendsResponse.data;
          }
        } catch (error2) {
          console.log('Method 2 also failed:', error2);
          // Method 3: Add some dummy data for testing
          users = [
            { id: 1, name: 'Test User 1', email: 'test1@example.com' },
            { id: 2, name: 'Test User 2', email: 'test2@example.com' },
            { id: 3, name: 'Test User 3', email: 'test3@example.com' }
          ];
          console.log('Using dummy data for testing');
        }
      }
      
      console.log('Users loaded:', users.length, users);

      // Normalize users to ensure numeric IDs
      users = (users || []).map((u: any) => ({
        ...u,
        id: Number(u.id),
      })).filter((u: any) => Number.isInteger(u.id) && u.id > 0);
      
      // Filter out current group members if we have the group
      const currentGroup = groups.find(g => g.id === showInviteModal);
      console.log('Current group:', currentGroup);
      
      const filtered = currentGroup 
        ? users.filter((u: any) => !currentGroup.members.includes(Number(u.id)))
        : users;
      
      console.log('Filtered users:', filtered.length, filtered);
      setAvailableUsers(filtered);
      
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(t('chat.errors.loadUsersFailed'));
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    const uid = Number(userId);
    setSelectedUsers(prev => 
      prev.includes(uid) 
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  const closeInviteModal = () => {
    setShowInviteModal(null);
    setSearchTerm('');
    setSelectedUsers([]);
    setAvailableUsers([]);
  };

  const handleInviteMembers = async (groupId: number) => {
    if (selectedUsers.length === 0) return;
    // Coerce and validate groupId to prevent malformed requests like /groups/p/invite
    const gid = Number(groupId);
    console.log('[InviteMembers] called with', { groupId, coerced: gid, selectedUsers });
    if (!Number.isInteger(gid) || gid <= 0) {
      console.warn('[InviteMembers] Invalid groupId detected', { groupId, coerced: gid });
      toast.error(t('chat.groups.errors.inviteFailed'));
      return;
    }
    const grp = groups.find(g => g.id === gid);
    if (!grp || currentUserId !== grp.ownerId) {
      toast.error(t('chat.groups.errors.inviteFailed'));
      return;
    }
    
    try {
      const numericMemberIds = selectedUsers.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
      console.log('[InviteMembers] sending', { gid, numericMemberIds });
      const res = await groupService.inviteMembers(gid, numericMemberIds);
      if (res.success) {
        console.log('[InviteMembers] response:', res.data);
        const { added = [], pending = [] } = res.data || {};
        
        if (added.length > 0 && pending.length > 0) {
          toast.success(`${added.length} ${t('chat.groups.success.membersAdded', 'members added')}, ${pending.length} ${t('chat.groups.success.inviteSent', 'invites sent')}`);
        } else if (added.length > 0) {
          toast.success(t('chat.groups.success.membersAdded', `${added.length} members added to group`));
        } else if (pending.length > 0) {
          toast.success(t('chat.groups.success.inviteSent', `${pending.length} invitations sent`));
        } else {
          toast.success(t('chat.groups.success.invited'));
        }
        
        closeInviteModal();
        loadGroups(groupSearchTerm); // Refresh groups to show updated member count
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('chat.groups.errors.inviteFailed'));
    }
  };

  // Load users when modal opens
  React.useEffect(() => {
    if (showInviteModal) {
      console.log('Invite modal opened for group:', showInviteModal);
      loadAvailableUsers();
    }
  }, [showInviteModal]);

  // Debug effect to monitor availableUsers changes
  React.useEffect(() => {
    console.log('Available users updated:', availableUsers);
  }, [availableUsers]);

  const handleAcceptInvite = async (invite: PendingInvite) => {
    try {
      await groupService.acceptGroupInvite(invite.group.id, invite.id);
      toast.success(t('chat.groups.success.inviteAccepted', 'Joined group'));
      loadGroups(groupSearchTerm);
      loadPendingInvites();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.groups.errors.inviteFailed'));
    }
  };

  const handleDeclineInvite = async (invite: PendingInvite) => {
    try {
      await groupService.declineGroupInvite(invite.group.id, invite.id);
      toast(t('chat.groups.info.inviteDeclined', 'Invitation declined'));
      loadPendingInvites();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.groups.errors.inviteFailed'));
    }
  };

  const fetchGroupPinStatus = async (groupId: number) => {
    try {
      const res = await pinService.getGroupPinStatus(groupId);
      setPinStatusMap((prev) => ({ ...prev, [groupId]: res.data.pinned }));
    } catch (e: any) {
      console.error('Failed to fetch group pin status:', e);
    }
  };

  const handleToggleGroupPin = async (groupId: number) => {
    try {
      setLoadingPinFor(groupId);
      const currentPinStatus = pinStatusMap[groupId] || false;
      const newPinStatus = !currentPinStatus;
      
      await pinService.togglePinGroup(groupId, newPinStatus);
      setPinStatusMap((prev) => ({ ...prev, [groupId]: newPinStatus }));
      
      toast.success(newPinStatus ? t('chat.groups.pinned', 'Group pinned') : t('chat.groups.unpinned', 'Group unpinned'));
      setOpenMenuId(null);
      
      // Refresh groups to show new pin order
      loadGroups(groupSearchTerm);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.groups.errors.pin', 'Failed to update pin status'));
    } finally {
      setLoadingPinFor(null);
    }
  };

  const handleGroupMenuToggle = async (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openMenuId === groupId ? null : groupId;
    setOpenMenuId(next);
    if (next) {
      fetchGroupPinStatus(groupId);
    }
  };

  const onCreateGroup = () => setShowCreateModal(true);


  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('chat.groups.title')}</h2>
          <button onClick={onCreateGroup} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors">
            {t('chat.groups.create')}
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={groupSearchTerm}
            onChange={(e) => setGroupSearchTerm(e.target.value)}
            placeholder={t('chat.groups.searchPlaceholder', 'Tìm kiếm nhóm...')}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm transition-all"
          />
          {groupSearchTerm && (
            <button
              onClick={() => setGroupSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Pending Group Invitations */}
      {pendingInvites.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('chat.groups.pendingInvites.title', 'Group Invitations')} ({pendingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((invite, index) => (
              <LazyLoad
                key={invite.id}
                threshold={0.1}
                rootMargin="50px"
                animationDuration={400}
                delay={index * 30}
                reAnimate={true}
              >
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md flex-shrink-0">
                    {invite.group.avatar ? (
                      <img src={invite.group.avatar} alt={invite.group.name} className="w-full h-full object-cover" />
                    ) : (
                      invite.group.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {invite.group.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('chat.groups.pendingInvites.invitedBy', 'Invited by')} {invite.inviter.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    {t('chat.groups.pendingInvites.accept', 'Accept')}
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite)}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    {t('chat.groups.pendingInvites.decline', 'Decline')}
                  </button>
                </div>
              </div>
              </LazyLoad>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-3">{groupSearchTerm ? '🔍' : '👥'}</div>
            <p className="font-medium">
              {groupSearchTerm 
                ? t('chat.groups.empty.noResults', 'Không tìm thấy nhóm nào')
                : t('chat.groups.empty.noGroups')
              }
            </p>
            <p className="text-sm mt-1">
              {groupSearchTerm 
                ? t('chat.groups.empty.tryDifferent', 'Thử tìm kiếm với từ khóa khác')
                : t('chat.groups.empty.createFirst')
              }
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {groups.map((g, index) => (
              <LazyLoad
                key={g.id}
                threshold={0.1}
                rootMargin="50px"
                animationDuration={400}
                delay={index * 30}
                reAnimate={true}
              >
              <li
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  // Optimistically reset unread count when opening the group
                  setGroups((prev) => prev.map((x) => x.id === g.id ? ({ ...x, unreadCount: 0 }) : x));
                  // Persist override so subsequent loadGroups() keeps 0 until a new message arrives
                  setUnreadOverride((prev) => ({ ...prev, [g.id]: 0 }));
                  // Notify backend to mark as read right away; then refresh list
                  try { void groupService.markGroupMessagesRead(g.id).then(() => loadGroups(groupSearchTerm)).catch(() => loadGroups(groupSearchTerm)); } catch {}
                  onSelectGroup?.(g);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar wrapper to allow badge overflow without clipping */}
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md">
                      {g.avatar ? (
                        <img src={g.avatar} alt={g.name} className="w-full h-full object-cover" />
                      ) : (
                        (g.name || '').charAt(0)
                      )}
                    </div>
                    {(() => {
                      const count = (unreadOverride[g.id] !== undefined) ? (unreadOverride[g.id] as number) : (((g as any).unreadCount) || 0);
                      return count > 0 ? (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center shadow">
                          {count}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                      <span className="truncate">{g.name}</span>
                      {(pinStatusMap[g.id] || (g as any).isPinned || (g as any).pinned) && (
                        <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('chat.groups.status.membersCount', { count: g.members.length })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {currentUserId === g.ownerId && (
                    <button
                      onClick={() => setShowInviteModal(g.id)}
                      className="px-2 py-1 text-xs rounded border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      {t('chat.groups.actions.addMembers')}
                    </button>
                  )}
                  
                  {/* Group Options Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => handleGroupMenuToggle(g.id, e)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {openMenuId === g.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        />
                        <div className="absolute right-0 top-8 z-20 min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          <button
                            disabled={loadingPinFor === g.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleGroupPin(g.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
                          >
                            {pinStatusMap[g.id] ? (
                              <>
                                <PinOff className="w-4 h-4" />
                                {t('chat.groups.actions.unpin', 'Unpin')}
                              </>
                            ) : (
                              <>
                                <Pin className="w-4 h-4" />
                                {t('chat.groups.actions.pin', 'Pin')}
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
              </LazyLoad>
            ))}
          </ul>
        )}
      </div>

      {/* Create Group Modal */}
      <GroupEditorModal
        isOpen={showCreateModal}
        mode="create"
        initial={null}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Success toast is shown inside GroupEditorModal; avoid duplicate toast here
          setShowCreateModal(false);
          loadGroups(groupSearchTerm);
        }}
      />

      {/* Invite Modal */}
      <InviteMembersModal
        isOpen={!!(showInviteModal && groups.find(g => g.id === showInviteModal)?.ownerId === currentUserId)}
        groupName={groups.find(g => g.id === showInviteModal)?.name}
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          loadAvailableUsers(value);
        }}
        availableUsers={availableUsers}
        selectedUsers={selectedUsers}
        loadingUsers={loadingUsers}
        onToggleUser={toggleUserSelection}
        onConfirm={() => showInviteModal && handleInviteMembers(showInviteModal)}
        onClose={closeInviteModal}
      />
    </div>
  );
});

GroupsTab.displayName = 'GroupsTab';

export default GroupsTab;

