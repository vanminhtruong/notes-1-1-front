import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RemoveMembersModalProps } from '../../interface/ChatUI.interface';

const RemoveMembersModal: React.FC<RemoveMembersModalProps> = ({ isOpen, members, onClose, onConfirm }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden" role="document">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold">{t('chat.groups.actions.removeMember', 'Remove member(s)')}</h3>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onClose}>&times;</button>
        </div>
        <div className="p-4 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('chat.groups.remove.searchPlaceholder', 'Search members...') as string}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">{filtered.length} {t('chat.groups.status.membersCount', { count: filtered.length })}</span>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allChecked}
                onChange={() => toggleAll()}
              />
              <span className="text-indigo-600 hover:underline">
                {allChecked ? t('common.unselectAll') : t('common.selectAll')}
              </span>
            </label>
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-gray-200 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-800">
            {filtered.map((m) => (
              <label key={m.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} />
                {m.avatar ? (
                  <img src={m.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {getInitials(m.name)}
                  </div>
                )}
                {renderName(m.name)}
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">{t('chat.empty.noMembers', 'No members')}</div>
            )}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
          <button className="px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800" onClick={onClose}>{t('common.cancel', 'Cancel')}</button>
          <button
            disabled={selected.size === 0 || submitting}
            onClick={handleConfirm}
            className="px-3 py-2 text-sm rounded-md bg-red-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? t('common.pleaseWait', 'Please wait...')
              : selected.size > 0
                ? t('chat.groups.actions.removeCount', `Remove (${selected.size})`)
                : t('chat.groups.actions.removeMember', 'Remove member(s)')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMembersModal;
