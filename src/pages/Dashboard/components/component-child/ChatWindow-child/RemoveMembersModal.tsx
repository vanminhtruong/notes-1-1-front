import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserMinus, Search, Users, Loader2, AlertCircle } from 'lucide-react';
import type { RemoveMembersModalProps } from '../../interface/ChatUI.interface';

const RemoveMembersModal = memo(({ isOpen, members, onClose, onConfirm }: RemoveMembersModalProps) => {
  const { t } = useTranslation('dashboard');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const titleId = 'remove-members-title';
  const selectAllRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name?.toLowerCase().includes(q));
  }, [members, query]);

  // Keep select-all checkbox in indeterminate state when some but not all filtered items are selected
  useEffect(() => {
    const total = filtered.length;
    const selectedInFiltered = filtered.filter(m => selected.has(m.id)).length;
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedInFiltered > 0 && selectedInFiltered < total;
    }
  }, [filtered, selected]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + (last || '')).toUpperCase();
  };

  const renderName = (name?: string) => {
    const n = name || '';
    const q = query.trim();
    if (!q) return <span className="text-sm text-gray-800 dark:text-gray-200">{n}</span>;
    const idx = n.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span className="text-sm text-gray-800 dark:text-gray-200">{n}</span>;
    const before = n.slice(0, idx);
    const match = n.slice(idx, idx + q.length);
    const after = n.slice(idx + q.length);
    return (
      <span className="text-sm text-gray-800 dark:text-gray-200">
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-700 rounded-sm px-0.5">{match}</mark>
        {after}
      </span>
    );
  };

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allChecked = filtered.length > 0 && filtered.every(m => selected.has(m.id));
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) {
        filtered.forEach(m => next.delete(m.id));
      } else {
        filtered.forEach(m => next.add(m.id));
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    try {
      setSubmitting(true);
      await onConfirm(Array.from(selected));
      setSelected(new Set());
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-1.5 z-50 animate-fadeIn"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={titleId}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-xl md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-2xl w-[540px] max-w-full max-h-[90vh] overflow-hidden animate-slideUp flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 xl-down:px-5 xl-down:py-4 lg-down:px-5 lg-down:py-4 md-down:px-4 md-down:py-3.5 sm-down:px-3.5 sm-down:py-3 xs-down:px-3 xs-down:py-2.5">
          <div className="flex items-center gap-3 md-down:gap-2.5 xs-down:gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md md-down:w-9 md-down:h-9 xs-down:w-8 xs-down:h-8">
              <UserMinus className="w-5 h-5 text-white md-down:w-4.5 md-down:h-4.5 xs-down:w-4 xs-down:h-4" />
            </div>
            <div>
              <h3 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white xl-down:text-lg lg-down:text-lg md-down:text-base sm-down:text-base xs-down:text-sm">
                {t('chat.groups.actions.removeMember', 'Xóa thành viên')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.groups.remove.subtitle', { count: members.length, defaultValue: `Chọn thành viên để xóa khỏi nhóm` })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 disabled:opacity-50 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6"
            aria-label={t('actions.close', 'Close')}
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 xl-down:p-5 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3">
          {/* Search Input */}
          <div className="mb-4 md-down:mb-3 xs-down:mb-2.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              <Search className="w-4 h-4 text-red-600 dark:text-red-400 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
              {t('chat.groups.remove.searchLabel', 'Tìm kiếm thành viên')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none md-down:pl-2.5 xs-down:pl-2">
                <Search className="h-5 w-5 text-gray-400 md-down:h-4 md-down:w-4 xs-down:h-3.5 xs-down:w-3.5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('chat.groups.remove.searchPlaceholder', 'Tìm kiếm thành viên...') as string}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 placeholder:text-gray-400 md-down:pl-9 md-down:pr-3 md-down:py-2 md-down:text-sm xs-down:pl-8 xs-down:pr-2.5 xs-down:py-1.5 xs-down:text-xs"
              />
            </div>
          </div>
          {/* Selected Members Pills */}
          {selected.size > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 md-down:mb-3 md-down:p-3 xs-down:mb-2.5 xs-down:p-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300 mb-3 md-down:text-xs md-down:mb-2 xs-down:text-[11px] xs-down:mb-1.5">
                <UserMinus className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                {t('chat.groups.remove.selected', 'Đã chọn')} ({selected.size})
              </div>
              <div className="flex flex-wrap gap-2 md-down:gap-1.5 xs-down:gap-1">
                {Array.from(selected).map(userId => {
                  const member = filtered.find(m => m.id === userId);
                  if (!member) return null;
                  return (
                    <div
                      key={userId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-full text-sm text-gray-900 dark:text-white shadow-sm md-down:gap-1.5 md-down:px-2.5 md-down:py-1 md-down:text-xs xs-down:gap-1 xs-down:px-2 xs-down:py-0.5 xs-down:text-[11px]"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold md-down:w-4 md-down:h-4 md-down:text-[10px] xs-down:w-3.5 xs-down:h-3.5 xs-down:text-[9px]">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(member.name)
                        )}
                      </div>
                      <span className="font-medium">{member.name}</span>
                      <button
                        onClick={() => toggle(userId)}
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

          {/* Member List Header */}
          <div className="flex items-center justify-between mb-3 md-down:mb-2 xs-down:mb-1.5">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 md-down:text-xs xs-down:text-[11px]">
              {filtered.length} {t('chat.groups.status.membersCount', { count: filtered.length })}
            </span>
            {filtered.length > 0 && (
              <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => toggleAll()}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3"
                />
                <span className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:underline md-down:text-xs xs-down:text-[11px]">
                  {allChecked ? t('common.unselectAll', 'Bỏ chọn tất cả') : t('common.selectAll', 'Chọn tất cả')}
                </span>
              </label>
            )}
          </div>
          {/* Member List */}
          <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden md-down:rounded-lg xs-down:rounded-md">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 md-down:px-3 md-down:py-1.5 xs-down:px-2.5 xs-down:py-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.groups.remove.listTitle', { count: filtered.length, defaultValue: `Danh sách (${filtered.length})` })}
              </p>
            </div>
            <div className="max-h-[320px] overflow-y-auto md-down:max-h-[280px] sm-down:max-h-[240px] xs-down:max-h-[200px]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center md-down:py-10 xs-down:py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 md-down:w-14 md-down:h-14 md-down:mb-2.5 xs-down:w-12 xs-down:h-12 xs-down:mb-2">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 md-down:text-xs xs-down:text-[11px]">
                    {query ? t('chat.search.noResults', 'Không tìm thấy kết quả') : t('chat.empty.noMembers', 'Không có thành viên')}
                  </p>
                  {query && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 md-down:text-[11px] xs-down:text-[10px]">
                      {t('chat.search.tryDifferent', 'Thử tìm kiếm với từ khóa khác')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((m) => {
                    const isSelected = selected.has(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggle(m.id)}
                        className={`group flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-all duration-200 md-down:px-3 md-down:py-2.5 xs-down:px-2.5 xs-down:py-2 ${
                          isSelected 
                            ? 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 md-down:gap-2.5 xs-down:gap-2">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white dark:ring-gray-800 md-down:w-9 md-down:h-9 xs-down:w-8 xs-down:h-8">
                              {m.avatar ? (
                                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm md-down:text-xs xs-down:text-[11px]">{getInitials(m.name)}</span>
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5">
                                <svg className="w-3 h-3 text-white md-down:w-2.5 md-down:h-2.5 xs-down:w-2 xs-down:h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate md-down:text-xs xs-down:text-[11px]">
                              {renderName(m.name)}
                            </div>
                          </div>
                        </div>
                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5 ${
                          isSelected 
                            ? 'bg-red-600 border-red-600 dark:bg-red-500 dark:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-red-400 dark:group-hover:border-red-500'
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

          {/* Warning Notice */}
          {selected.size > 0 && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg md-down:mt-3 md-down:p-2.5 xs-down:mt-2.5 xs-down:p-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
              <p className="text-xs text-red-700 dark:text-red-300 md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.groups.remove.warning', 'Thành viên bị xóa sẽ không thể truy cập nhóm này nữa')}
              </p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 xl-down:px-5 xl-down:py-3.5 lg-down:px-5 lg-down:py-3.5 md-down:px-4 md-down:py-3 sm-down:px-3.5 sm-down:py-2.5 xs-down:px-3 xs-down:py-2 md-down:gap-2.5 xs-down:gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 md-down:px-4 md-down:py-2 md-down:text-xs xs-down:px-3 xs-down:py-1.5 xs-down:text-[11px]"
          >
            {t('common.cancel', 'Hủy')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0 || submitting}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg md-down:px-4 md-down:py-2 md-down:text-xs md-down:gap-1.5 xs-down:px-3 xs-down:py-1.5 xs-down:text-[11px] xs-down:gap-1"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                {t('common.pleaseWait', 'Đang xử lý...')}
              </>
            ) : (
              <>
                <UserMinus className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                {selected.size > 0
                  ? t('chat.groups.actions.removeCount', { count: selected.size, defaultValue: `Xóa (${selected.size})` })
                  : t('chat.groups.actions.removeMember', 'Xóa thành viên')}
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

RemoveMembersModal.displayName = 'RemoveMembersModal';

export default RemoveMembersModal;

