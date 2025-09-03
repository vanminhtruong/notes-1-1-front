import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import React from 'react';
import { groupService } from '../../../../../services/groupService';
import { getSocket } from '../../../../../services/socket';
import { chatService } from '../../../../../services/chatService';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../../../../store';
import GroupEditorModal from './GroupEditorModal';
import type { GroupsTabProps, GroupItem, PendingInvite } from '../../interface/ChatUI.interface';

const GroupsTab = ({ onSelectGroup }: GroupsTabProps) => {
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
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await groupService.listMyGroups();
      if (res.success) setGroups(res.data || []);
    } catch (e) {
      // noop
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
    loadGroups();
    loadPendingInvites();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onGroupCreated = () => loadGroups();
    const onGroupInvited = () => {
      // Refresh pending invites when new invitation received
      loadPendingInvites();
      toast(t('chat.groups.notifications.newInvite', 'You have a new group invitation'));
    };
    const onMembersAdded = () => loadGroups();
    const onMemberLeft = () => loadGroups();
    const onGroupLeft = () => loadGroups();
    const onGroupUpdated = () => loadGroups();

    socket.on('group_created', onGroupCreated);
    socket.on('group_invited', onGroupInvited);
    socket.on('group_members_added', onMembersAdded);
    socket.on('group_member_left', onMemberLeft);
    socket.on('group_left', onGroupLeft);
    socket.on('group_updated', onGroupUpdated);

    return () => {
      socket.off('group_created', onGroupCreated);
      socket.off('group_invited', onGroupInvited);
      socket.off('group_members_added', onMembersAdded);
      socket.off('group_member_left', onMemberLeft);
      socket.off('group_left', onGroupLeft);
      socket.off('group_updated', onGroupUpdated);
    };
  }, []);

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
      
      // Filter out current group members if we have the group
      const currentGroup = groups.find(g => g.id === showInviteModal);
      console.log('Current group:', currentGroup);
      
      const filtered = currentGroup 
        ? users.filter((u: any) => !currentGroup.members.includes(u.id))
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
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
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
    const grp = groups.find(g => g.id === groupId);
    if (!grp || currentUserId !== grp.ownerId) {
      toast.error(t('chat.groups.errors.inviteFailed'));
      return;
    }
    
    try {
      const res = await groupService.inviteMembers(groupId, selectedUsers);
      if (res.success) {
        toast.success(t('chat.groups.success.invited'));
        closeInviteModal();
        loadGroups(); // Refresh groups to show updated member count
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
      loadGroups();
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

  const onCreateGroup = () => setShowCreateModal(true);


  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('chat.groups.title')}</h2>
        <button onClick={onCreateGroup} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full">
          {t('chat.groups.create')}
        </button>
      </div>

      {/* Pending Group Invitations */}
      {pendingInvites.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('chat.groups.pendingInvites.title', 'Group Invitations')} ({pendingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
              >
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
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-medium">{t('chat.groups.empty.noGroups')}</p>
            <p className="text-sm mt-1">{t('chat.groups.empty.createFirst')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => (
              <li
                key={g.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => onSelectGroup?.(g)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md flex-shrink-0">
                    {g.avatar ? (
                      <img src={g.avatar} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      (g.name || '').charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{g.name}</div>
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
                </div>
              </li>
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
          loadGroups();
        }}
      />

      {/* Invite Modal */}
      {showInviteModal && (groups.find(g => g.id === showInviteModal)?.ownerId === currentUserId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => closeInviteModal()}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-hidden flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('chat.groups.invite.title')}</h3>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  loadAvailableUsers(e.target.value);
                }}
                placeholder={t('chat.groups.invite.placeholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Selected ({selectedUsers.length}):</div>
                <div className="flex flex-wrap gap-1">
                  {selectedUsers.map(userId => {
                    const user = availableUsers.find(u => u.id === userId);
                    return user ? (
                      <span key={userId} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {user.name}
                        <button onClick={() => toggleUserSelection(userId)} className="ml-1 hover:text-blue-600">
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* User List */}
            <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md mb-4 min-h-[200px]">
              {loadingUsers ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
              ) : availableUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No users found{searchTerm && ` for "${searchTerm}"`}
                  <div className="text-xs mt-1">Debug: Check console for API responses</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="text-blue-600 dark:text-blue-400">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleInviteMembers(showInviteModal)}
                disabled={selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('chat.groups.invite.addButton')} ({selectedUsers.length})
              </button>
              <button
                onClick={() => closeInviteModal()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                {t('chat.groups.createModal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  
}
;

export default GroupsTab;
