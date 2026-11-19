import { Search, Check, X, UserPlus, MessageSquare, Ban, MoreVertical } from 'lucide-react';
import { useState, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { UsersListProps } from '../../interface/ChatUI.interface';
import type { User } from '../../interface/ChatTypes.interface';
import { blockService, type BlockStatus } from '@/services/blockService';
import LazyLoad from '@/components/LazyLoad';
import './chat-tabs.css';

const UsersList = memo(({
  friendRequests,
  filteredUsers,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onSendFriendRequest,
  onStartChat,
  onBlockUser,
}: UsersListProps) => {
  const { t } = useTranslation('dashboard');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [blockStatusMap, setBlockStatusMap] = useState<Record<number, BlockStatus | undefined>>({});

  // Fetch block status for all visible users
  useEffect(() => {
    const fetchBlockStatuses = async () => {
      const allUsers = [...friendRequests, ...filteredUsers];
      for (const user of allUsers) {
        if (!blockStatusMap[user.id]) {
          try {
            const res = await blockService.getStatus(user.id);
            setBlockStatusMap((prev) => ({ ...prev, [user.id]: res.data }));
          } catch (e) {
            // Silent fail
          }
        }
      }
    };
    fetchBlockStatuses();
  }, [friendRequests, filteredUsers]);
  return (
    <div className="ct ct-scroll h-full flex flex-col">
      {/* User Lists */}
      <div className="ct-list">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div>
            <h4 className="ct-section">
              {t('chat.usersList.friendRequests')}<span className="ct-section-count">{friendRequests.length}</span>
            </h4>
            {friendRequests.map((user, index) => (
              <LazyLoad
                key={user.id}
                threshold={0.1}
                rootMargin="50px"
                animationDuration={400}
                delay={index * 30}
                reAnimate={true}
              >
                <div className="ct-row ct-row--static">
                <div className="ct-avatar-wrap">
                  <div className="ct-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  {blockStatusMap[user.id]?.blockedByMe && (
                    <div className="ct-dot ct-dot--blocked">
                      <Ban className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="ct-body">
                  <p className="ct-name-text">{user.name}</p>
                  <p className="ct-sub">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 md-down:flex-row md-down:items-center md-down:gap-2">
                  <button
                    onClick={() => onAcceptFriendRequest(user.id)}
                    className="ct-icon-btn ct-icon-btn--ok"
                    title={t('chat.usersList.actions.accept')}
                    aria-label={t('chat.usersList.actions.acceptRequest')}
                  >
                    <Check className="w-5 h-5" />
                    <span className="sr-only">{t('chat.usersList.actions.accept')}</span>
                  </button>
                  <button
                    onClick={() => onRejectFriendRequest(user.id)}
                    className="ct-icon-btn ct-icon-btn--danger"
                    title={t('chat.usersList.actions.reject')}
                    aria-label={t('chat.usersList.actions.rejectRequest')}
                  >
                    <X className="w-5 h-5" />
                    <span className="sr-only">{t('chat.usersList.actions.reject')}</span>
                  </button>
                </div>
              </div>
              </LazyLoad>
            ))}
          </div>
        )}

        {/* Users search results (not friends, not self, no pending request) */}
        {filteredUsers.length > 0 && (
          <div>
            <h4 className="ct-section">
              {t('chat.usersList.users')}<span className="ct-section-count">{filteredUsers.length}</span>
            </h4>
            {filteredUsers.map((user, index) => (
              <LazyLoad
                key={user.id}
                threshold={0.1}
                rootMargin="50px"
                animationDuration={400}
                delay={index * 30}
                reAnimate={true}
              >
                <div className="ct-row ct-row--static">
                <div className="ct-avatar-wrap">
                  <div className="ct-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  {blockStatusMap[user.id]?.blockedByMe && (
                    <div className="ct-dot ct-dot--blocked">
                      <Ban className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="ct-body">
                  <p className="ct-name-text">{user.name}</p>
                  <p className="ct-sub">{user.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0 md-down:flex-row md-down:items-center md-down:gap-2">
                  {/* Gửi kết bạn giữ bên ngoài */}
                  <button
                    onClick={() => onSendFriendRequest(user.id)}
                    className="ct-icon-btn ct-icon-btn--solid"
                    title={t('chat.usersList.sendRequest')}
                    aria-label={t('chat.usersList.sendRequest')}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="sr-only">{t('chat.usersList.sendRequest')}</span>
                  </button>
                  {/* Menu ba chấm chứa Message + Block */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = openMenuId === user.id ? null : user.id;
                        setOpenMenuId(next);
                        if (next) {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                          setMenuUser(user);
                        } else {
                          setMenuPos(null);
                          setMenuUser(null);
                        }
                      }}
                      className="ct-icon-btn"
                      title={t('chat.menu.options')}
                      aria-label={t('chat.menu.options')}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              </LazyLoad>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && friendRequests.length === 0 && (
          <div className="ct-empty">
            <div className="ct-empty-icon">
              <Search className="w-8 h-8" strokeWidth={1.7} />
            </div>
            <p className="ct-empty-title">{t('chat.usersList.empty.noResults')}</p>
            <p className="ct-empty-desc">{t('chat.usersList.empty.tryAnother')}</p>
          </div>
        )}
      </div>
      {/* Portal menu fixed để tránh bị ancestor che */}
      {openMenuId && menuUser && menuPos
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenMenuId(null);
                  setMenuPos(null);
                  setMenuUser(null);
                }}
              />
              <div
                className="ct-menu fixed z-[70]"
                style={{ top: menuPos.top, right: menuPos.right }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartChat(menuUser);
                    setOpenMenuId(null);
                    setMenuPos(null);
                    setMenuUser(null);
                  }}
                  className="ct-menu-item"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('chat.usersList.actions.message', 'Nhắn tin')}
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Update blockStatusMap optimistically
                    setBlockStatusMap((prev) => ({ 
                      ...prev, 
                      [menuUser.id]: { 
                        blockedByMe: true, 
                        blockedMe: false, 
                        isEitherBlocked: true, 
                        blockId: null 
                      } 
                    }));
                    await onBlockUser(menuUser);
                    setOpenMenuId(null);
                    setMenuPos(null);
                    setMenuUser(null);
                  }}
                  className="ct-menu-item ct-menu-item--danger"
                >
                  <Ban className="w-4 h-4" />
                  {t('chat.actions.block', 'Chặn')}
                </button>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
});

UsersList.displayName = 'UsersList';

export default UsersList;

