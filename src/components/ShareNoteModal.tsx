import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserCheck, Users as UsersIcon, Search, Send } from 'lucide-react';
import { notesService } from '../services/notesService';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import { groupService, type GroupSummary } from '../services/groupService';
import type { Note } from '../services/notesService';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface ShareTarget {
  id: number;
  name: string;
  type: 'user' | 'group';
  avatar?: string;
  email?: string;
  memberCount?: number;
}

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSuccess?: () => void;
}

const ShareNoteModal = ({ isOpen, onClose, note, onSuccess }: ShareNoteModalProps) => {
  const { t } = useTranslation('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [shareType, setShareType] = useState<'users' | 'groups'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<ShareTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ShareTarget | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load data (users and groups)
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, shareType]);

  // Filter targets based on search
  useEffect(() => {
    const targets = shareType === 'users' 
      ? users.map(user => ({ 
          id: user.id, 
          name: user.name, 
          type: 'user' as const, 
          avatar: user.avatar, 
          email: user.email 
        }))
      : groups.map(group => ({ 
          id: group.id, 
          name: group.name, 
          type: 'group' as const, 
          avatar: group.avatar,
          memberCount: group.members?.length || 0
        }));

    if (searchTerm.trim()) {
      const filtered = targets.filter(target => 
        target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (target.type === 'user' && target.email && target.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTargets(filtered);
    } else {
      setFilteredTargets(targets);
    }
  }, [searchTerm, users, groups, shareType]);

  const loadData = async () => {
    try {
      setIsSearching(true);
      if (shareType === 'users') {
        await loadUsers();
      } else {
        await loadGroups();
      }
    } finally {
      setIsSearching(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users for sharing...');
      const response = await userService.getFriends();
      console.log('Users loaded:', response.friends);
      setUsers(response.friends || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(t('errors.loadUsers') || 'Không thể tải danh sách người dùng');
      // Set fallback test users for development
      setUsers([
        { id: 1, name: 'Test User 1', email: 'user1@test.com' },
        { id: 2, name: 'Test User 2', email: 'user2@test.com' },
        { id: 3, name: 'Test User 3', email: 'user3@test.com' }
      ]);
    }
  };

  const loadGroups = async () => {
    try {
      console.log('Loading groups for sharing...');
      const response = await groupService.listMyGroups();
      console.log('Groups loaded:', response.data);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error(t('errors.loadGroups') || 'Không thể tải danh sách nhóm');
      setGroups([]);
    }
  };

  const handleShare = async () => {
    if (!note || !selectedTarget) return;

    try {
      setIsLoading(true);
      
      // Create note content for sharing
      const contentToSend = (() => {
        const payload = {
          type: 'note',
          v: 1,
          id: note.id,
          title: note.title,
          content: note.content || '',
          imageUrl: note.imageUrl || null,
          category: note.category,
          priority: note.priority,
        };
        return 'NOTE_SHARE::' + encodeURIComponent(JSON.stringify(payload));
      })();

      if (selectedTarget.type === 'user') {
        // 1. Send message to individual chat for UI display first to get messageId
        let messageId = null;
        try {
          console.log('📤 Sending note share message to user:', selectedTarget.id);
          const messageResponse = await chatService.sendMessage(selectedTarget.id, contentToSend, 'text');
          messageId = messageResponse?.data?.id;
          console.log('✅ Sent note share message to individual chat, messageId:', messageId);
          console.log('📋 Message response structure:', messageResponse);
        } catch (chatError) {
          console.error('⚠️ Failed to send individual chat message:', chatError);
        }
        
        // 2. Create individual shared note record for admin tracking with messageId
        await notesService.shareNote(note.id, {
          userId: selectedTarget.id,
          canEdit: canEdit,
          canDelete: canDelete,
          message: message.trim() || undefined,
          messageId: messageId || undefined
        });
        console.log('✅ Created SharedNote record with messageId:', messageId);
        
        toast.success(t('notes.share.success') || `Đã chia sẻ ghi chú với ${selectedTarget.name}`);
      } else {
        // Share to group chat (new functionality)
        try {
          // 1. Send message to group chat for UI display first to get groupMessageId
          let groupMessageId = null;
          try {
            console.log('📤 Sending note share message to group:', selectedTarget.id);
            const messageResponse = await groupService.sendGroupMessage(selectedTarget.id, contentToSend, 'text');
            groupMessageId = messageResponse?.data?.id;
            console.log('✅ Sent note share message to group chat, groupMessageId:', groupMessageId);
            console.log('📋 Group message response structure:', messageResponse);
          } catch (chatError) {
            console.error('⚠️ Failed to send group chat message:', chatError);
          }

          // 2. Create GroupSharedNote record for admin tracking with groupMessageId
          await notesService.shareNoteToGroup(note.id, {
            groupId: selectedTarget.id,
            message: message.trim() || undefined,
            groupMessageId: groupMessageId || undefined
          });
          console.log('✅ Created GroupSharedNote record with groupMessageId:', groupMessageId);
          
          toast.success(t('notes.share.successGroup') || `Đã chia sẻ ghi chú trong nhóm ${selectedTarget.name}`);
        } catch (chatError) {
          console.error('⚠️ Failed to share note to group:', chatError);
          throw chatError;
        }
      }
      
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error sharing note:', error);
      const errorMessage = error?.response?.data?.message || 
                          t('notes.share.error') || 
                          'Không thể chia sẻ ghi chú';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedTarget(null);
    setCanEdit(false);
    setCanDelete(false);
    setMessage('');
    onClose();
  };

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('notes.share.title') || 'Chia sẻ ghi chú'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Note Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">
              {note.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {note.content || t('notes.noContent') || 'Không có nội dung'}
            </p>
            <div className="flex gap-2 mt-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                note.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                note.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {t(`notes.priority.${note.priority}`) || note.priority}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {t(`notes.category.${note.category}`) || note.category}
              </span>
            </div>
          </div>

          {/* Share Type Tabs */}
          <div>
            <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
              <button
                onClick={() => setShareType('users')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  shareType === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {t('notes.share.users') || 'Người dùng'}
                </div>
              </button>
              <button
                onClick={() => setShareType('groups')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  shareType === 'groups'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  {t('notes.share.groups') || 'Nhóm'}
                </div>
              </button>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {shareType === 'users' 
                ? (t('notes.share.selectUser') || 'Chọn người nhận')
                : (t('notes.share.selectGroup') || 'Chọn nhóm')
              }
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  shareType === 'users' 
                    ? (t('notes.share.searchPlaceholderUsers') || 'Tìm kiếm người dùng...')
                    : (t('notes.share.searchPlaceholderGroups') || 'Tìm kiếm nhóm...')
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Selected Target */}
          {selectedTarget && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {selectedTarget.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {selectedTarget.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedTarget.type === 'user' 
                        ? selectedTarget.email 
                        : `${selectedTarget.memberCount || 0} thành viên`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTarget(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {t('actions.cancel') || 'Hủy'}
                  </span>
                </button>
              </div>
            </div>
          )}
          {!selectedTarget && (
            <div>
              <div className="text-xs text-gray-500 mb-2">
                {filteredTargets.length} {shareType === 'users' 
                  ? (t('notes.share.availableUsers') || 'người dùng có sẵn')
                  : (t('notes.share.availableGroups') || 'nhóm có sẵn')
                }
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {isSearching ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredTargets.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredTargets.map((target) => (
                    <button
                      key={`${target.type}-${target.id}`}
                      onClick={() => setSelectedTarget(target)}
                      className="w-full flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {target.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3 text-left">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {target.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {target.type === 'user' 
                            ? target.email 
                            : `${target.memberCount || 0} thành viên`
                          }
                        </p>
                      </div>
                      {target.type === 'group' && (
                        <div className="ml-auto">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <UsersIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">
                    {searchTerm 
                      ? (shareType === 'users' 
                          ? (t('notes.share.noResults') || 'Không tìm thấy người dùng')
                          : (t('notes.share.noGroupResults') || 'Không tìm thấy nhóm')
                        )
                      : (shareType === 'users' 
                          ? (t('notes.share.noUsers') || 'Chưa có người dùng')
                          : (t('notes.share.noGroups') || 'Chưa có nhóm')
                        )
                    }
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Permissions - Only for users */}
          {selectedTarget && selectedTarget.type === 'user' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('notes.share.permissions') || 'Quyền hạn'}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={canEdit}
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('notes.share.canEdit') || 'Cho phép chỉnh sửa'}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={canDelete}
                    onChange={(e) => setCanDelete(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('notes.share.canDelete') || 'Cho phép xóa'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Message */}
          {selectedTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {selectedTarget.type === 'user' 
                  ? (t('notes.share.message') || 'Tin nhắn (tùy chọn)')
                  : (t('notes.share.groupMessage') || 'Tin nhắn cho nhóm (tùy chọn)')
                }
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  selectedTarget.type === 'user' 
                    ? (t('notes.share.messagePlaceholder') || 'Gửi lời nhắn kèm theo...')
                    : (t('notes.share.groupMessagePlaceholder') || 'Gửi lời nhắn đến nhóm...')
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {message.length}/500
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pb-8 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('actions.cancel') || 'Hủy'}
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedTarget || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isLoading ? (t('actions.sharing') || 'Đang chia sẻ...') : (t('actions.share') || 'Chia sẻ')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareNoteModal;
