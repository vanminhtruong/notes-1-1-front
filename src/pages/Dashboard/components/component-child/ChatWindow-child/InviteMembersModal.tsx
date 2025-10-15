import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserPlus, Search, Users, Loader2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface InviteMembersModalProps {
  isOpen: boolean;
  groupName?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableUsers: User[];
  selectedUsers: number[];
  loadingUsers: boolean;
  onToggleUser: (userId: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  submitting?: boolean;
}

const InviteMembersModal: React.FC<InviteMembersModalProps> = memo(({
  isOpen,
  groupName,
  searchTerm,
  onSearchChange,
  availableUsers,
  selectedUsers,
  loadingUsers,
  onToggleUser,
  onConfirm,
  onClose,
  submitting = false,
}) => {
  const { t } = useTranslation('dashboard');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-1.5 z-50 animate-fadeIn"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-xl md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-2xl w-[540px] max-w-full max-h-[90vh] overflow-hidden animate-slideUp flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 xl-down:px-5 xl-down:py-4 lg-down:px-5 lg-down:py-4 md-down:px-4 md-down:py-3.5 sm-down:px-3.5 sm-down:py-3 xs-down:px-3 xs-down:py-2.5">
          <div className="flex items-center gap-3 md-down:gap-2.5 xs-down:gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md md-down:w-9 md-down:h-9 xs-down:w-8 xs-down:h-8">
              <UserPlus className="w-5 h-5 text-white md-down:w-4.5 md-down:h-4.5 xs-down:w-4 xs-down:h-4" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white xl-down:text-lg lg-down:text-lg md-down:text-base sm-down:text-base xs-down:text-sm">
                {t('chat.groups.invite.title')}
              </h3>
              {groupName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md-down:text-[11px] xs-down:text-[10px]">
                  {t('chat.groups.invite.subtitle', { groupName, defaultValue: `Mời thành viên vào ${groupName}` })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 disabled:opacity-50 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 xl-down:p-5 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3">
          {/* Search Input */}
          <div className="mb-4 md-down:mb-3 xs-down:mb-2.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
              {t('chat.groups.invite.searchLabel', 'Tìm kiếm người dùng')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none md-down:pl-2.5 xs-down:pl-2">
                <Search className="h-5 w-5 text-gray-400 md-down:h-4 md-down:w-4 xs-down:h-3.5 xs-down:w-3.5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('chat.groups.invite.placeholder')}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 placeholder:text-gray-400 md-down:pl-9 md-down:pr-3 md-down:py-2 md-down:text-sm xs-down:pl-8 xs-down:pr-2.5 xs-down:py-1.5 xs-down:text-xs"
              />
            </div>
          </div>

          {/* Selected Users Pills */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 md-down:mb-3 md-down:p-3 xs-down:mb-2.5 xs-down:p-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 md-down:text-xs md-down:mb-2 xs-down:text-[11px] xs-down:mb-1.5">
                <Users className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                {t('chat.groups.invite.selected', 'Đã chọn')} ({selectedUsers.length})
              </div>
              <div className="flex flex-wrap gap-2 md-down:gap-1.5 xs-down:gap-1">
                {selectedUsers.map(userId => {
                  const user = availableUsers.find(u => u.id === userId);
                  if (!user) return null;
                  return (
                    <div
                      key={userId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-full text-sm text-gray-900 dark:text-white shadow-sm md-down:gap-1.5 md-down:px-2.5 md-down:py-1 md-down:text-xs xs-down:gap-1 xs-down:px-2 xs-down:py-0.5 xs-down:text-[11px]"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold md-down:w-4 md-down:h-4 md-down:text-[10px] xs-down:w-3.5 xs-down:h-3.5 xs-down:text-[9px]">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium">{user.name}</span>
                      <button
                        onClick={() => onToggleUser(userId)}
                        className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3"
                      >
                        <X className="w-3 h-3 md-down:w-2.5 md-down:h-2.5 xs-down:w-2 xs-down:h-2" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden md-down:rounded-lg xs-down:rounded-md">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 md-down:px-3 md-down:py-1.5 xs-down:px-2.5 xs-down:py-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.groups.invite.availableUsers', 'Người dùng khả dụng')}
              </p>
            </div>
            <div className="max-h-[320px] overflow-y-auto md-down:max-h-[280px] sm-down:max-h-[240px] xs-down:max-h-[200px]">
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 md-down:py-10 md-down:gap-2.5 xs-down:py-8 xs-down:gap-2">
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 md-down:text-xs xs-down:text-[11px]">
                    {t('chat.groups.invite.loading', 'Đang tải người dùng...')}
                  </p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center md-down:py-10 xs-down:py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 md-down:w-14 md-down:h-14 md-down:mb-2.5 xs-down:w-12 xs-down:h-12 xs-down:mb-2">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 md-down:text-xs xs-down:text-[11px]">
                    {t('chat.groups.invite.noUsers', 'Không tìm thấy người dùng')}
                  </p>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 md-down:text-[11px] xs-down:text-[10px]">
                      {t('chat.groups.invite.tryDifferent', 'Thử tìm kiếm với từ khóa khác')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => onToggleUser(user.id)}
                        className={`group flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-all duration-200 md-down:px-3 md-down:py-2.5 xs-down:px-2.5 xs-down:py-2 ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 md-down:gap-2.5 xs-down:gap-2">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white dark:ring-gray-800 md-down:w-9 md-down:h-9 xs-down:w-8 xs-down:h-8">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm md-down:text-xs xs-down:text-[11px]">{user.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5">
                                <svg className="w-3 h-3 text-white md-down:w-2.5 md-down:h-2.5 xs-down:w-2 xs-down:h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate md-down:text-xs xs-down:text-[11px]">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate md-down:text-[11px] xs-down:text-[10px]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5 ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500' 
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
                        }`}>
                          {isSelected && (
                            <svg className="w-full h-full text-white p-0.5 xs-down:p-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 xl-down:px-5 xl-down:py-3.5 lg-down:px-5 lg-down:py-3.5 md-down:px-4 md-down:py-3 sm-down:px-3.5 sm-down:py-2.5 xs-down:px-3 xs-down:py-2 md-down:gap-2.5 xs-down:gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 md-down:px-4 md-down:py-2 md-down:text-xs xs-down:px-3 xs-down:py-1.5 xs-down:text-[11px]"
          >
            {t('chat.groups.createModal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={selectedUsers.length === 0 || submitting}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg md-down:px-4 md-down:py-2 md-down:text-xs md-down:gap-1.5 xs-down:px-3 xs-down:py-1.5 xs-down:text-[11px] xs-down:gap-1"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('chat.groups.invite.inviting', 'Đang mời...')}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                {t('chat.groups.invite.addButton')} ({selectedUsers.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
});

InviteMembersModal.displayName = 'InviteMembersModal';

export default InviteMembersModal;
