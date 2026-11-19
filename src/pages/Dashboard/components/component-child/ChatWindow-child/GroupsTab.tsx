import { useTranslation } from 'react-i18next';
import { useEffect, useState, memo } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
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
import './chat-tabs.css';

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
  // Viewport position of the context menu to avoid being clipped by overflow containers
  const [openMenuPos, setOpenMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [pinStatusMap, setPinStatusMap] = useState<Record<number, boolean>>({});
  const [loadingPinFor, setLoadingPinFor] = useState<number | null>(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const loadGroups = async (search?: string) => {
    setLoading(true);
    try {
      console.log('[GroupsTab] Loading groups...', { search });
      const res = await groupService.listMyGroups(search);
      if (res.success) {
        console.log('[GroupsTab] Groups loaded:', res.data);
        const data = res.data || [];
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
    socket.on('group_created', onGroupCreated);
    socket.on('group_invited', onGroupInvited);
    socket.on('group_members_added', onMembersAdded);
    socket.on('group_member_left', onMemberLeft);
    socket.on('group_left', onGroupLeft);
    socket.on('group_updated', onGroupUpdated);
    // Refresh conversation order when messages arrive; do not count unread messages.
    const onGroupMessage = () => loadGroups(groupSearchTerm);
    socket.on('group_message', onGroupMessage);

    return () => {
      socket.off('group_created', onGroupCreated);
      socket.off('group_invited', onGroupInvited);
      socket.off('group_members_added', onMembersAdded);
      socket.off('group_member_left', onMemberLeft);
      socket.off('group_left', onGroupLeft);
      socket.off('group_updated', onGroupUpdated);

      socket.off('group_message', onGroupMessage);
    };
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
      // Tính toán vị trí theo viewport để render menu ở layer fixed, tránh bị overflow/stacking context che
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      // Menu min width ~160px, đặt cạnh phải của nút
      const top = Math.round(rect.bottom + 8 + window.scrollY);
      const left = Math.round(rect.right - 180 + window.scrollX);
      setOpenMenuPos({ top, left });
      fetchGroupPinStatus(groupId);
    }
    else {
      setOpenMenuPos(null);
    }
  };

  const onCreateGroup = () => setShowCreateModal(true);


  return (
    <div className="ct h-full flex flex-col">
      <div className="ct-head">
        <div className="ct-head-top">
          <h2 className="ct-title">{t('chat.groups.title')}</h2>
          <button onClick={onCreateGroup} className="ct-btn ct-btn--solid">
            {t('chat.groups.create')}
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="ct-field-icon">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={groupSearchTerm}
            onChange={(e) => setGroupSearchTerm(e.target.value)}
            placeholder={t('chat.groups.searchPlaceholder', 'Tìm kiếm nhóm...')}
            className="ct-field"
          />
          {groupSearchTerm && (
            <button
              onClick={() => setGroupSearchTerm('')}
              className="ct-field-clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pending Group Invitations */}
      {pendingInvites.length > 0 && (
        <div className="ct-invites">
          <h3>
            {t('chat.groups.pendingInvites.title', 'Group Invitations')} ({pendingInvites.length})
          </h3>
          <div className="flex flex-col gap-2.5">
            {pendingInvites.map((invite, index) => (
              <LazyLoad
                key={invite.id}
                threshold={0.1}
                rootMargin="50px"
                animationDuration={400}
                delay={index * 30}
                reAnimate={true}
              >
              <div className="ct-card ct-card--invite">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="ct-avatar ct-avatar--sm ct-avatar--sq">
                    {invite.group.avatar ? (
                      <img src={invite.group.avatar} alt={invite.group.name} className="w-full h-full object-cover" />
                    ) : (
                      invite.group.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="ct-name-text">
                      {invite.group.name}
                    </div>
                    <div className="ct-members">
                      {t('chat.groups.pendingInvites.invitedBy', 'Invited by')} {invite.inviter.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    className="ct-btn ct-btn--sm ct-btn--ok"
                  >
                    {t('chat.groups.pendingInvites.accept', 'Accept')}
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite)}
                    className="ct-btn ct-btn--sm ct-btn--danger"
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

      <div className="ct-scroll p-3">
        {loading ? (
          <div className="ct-loading">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="ct-empty">
            <div className="ct-empty-icon" style={{ fontSize: 30 }}>{groupSearchTerm ? '🔍' : '👥'}</div>
            <p className="ct-empty-title">
              {groupSearchTerm 
                ? t('chat.groups.empty.noResults', 'Không tìm thấy nhóm nào')
                : t('chat.groups.empty.noGroups')
              }
            </p>
            <p className="ct-empty-desc">
              {groupSearchTerm 
                ? t('chat.groups.empty.tryDifferent', 'Thử tìm kiếm với từ khóa khác')
                : t('chat.groups.empty.createFirst')
              }
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
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
                className="ct-card"
                onClick={() => {
                  onSelectGroup?.(g);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar wrapper to allow badge overflow without clipping */}
                  <div className="ct-avatar-wrap">
                    <div className="ct-avatar ct-avatar--sq">
                      {g.avatar ? (
                        <img src={g.avatar} alt={g.name} className="w-full h-full object-cover" />
                      ) : (
                        (g.name || '').charAt(0)
                      )}
                    </div>

                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="ct-name">
                      <span className="truncate">{g.name}</span>
                      {(pinStatusMap[g.id] || (g as any).isPinned || (g as any).pinned) && (
                        <Pin className="ct-pin w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="ct-members">
                      {t('chat.groups.status.membersCount', { count: g.members.length })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {currentUserId === g.ownerId && (
                    <button
                      onClick={() => setShowInviteModal(g.id)}
                      className="ct-btn ct-btn--sm"
                    >
                      {t('chat.groups.actions.addMembers')}
                    </button>
                  )}
                  
                  {/* Group Options Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => handleGroupMenuToggle(g.id, e)}
                      className="ct-icon-btn"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === g.id && openMenuPos && createPortal(
                      <>
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setOpenMenuPos(null);
                          }}
                        />
                        <div
                          className="ct-menu fixed z-[9999]"
                          style={{ top: openMenuPos.top, left: openMenuPos.left }}
                        >
                          <button
                            disabled={loadingPinFor === g.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleGroupPin(g.id);
                            }}
                            className="ct-menu-item"
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
                      </>,
                      document.body
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

