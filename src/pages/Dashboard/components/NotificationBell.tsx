import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, MoreVertical } from 'lucide-react';
import type { NotificationBellProps } from './interface/NotificationBell.interface';

export default function NotificationBell({ total, ring, ringSeq, items, onItemClick, onClearAll, onDeleteItem }: NotificationBellProps) {
  const { t } = useTranslation('dashboard');
  const [open, setOpen] = useState(false);
  const [periodic, setPeriodic] = useState(false);
  const timerRef = useRef<number | null>(null);
  const pulseRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const hasUnread = total > 0;

  // Periodic shake: every 1s, shake for ~0.8s
  useEffect(() => {
    // clear any previous timers
    const clearTimers = () => {
      if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
      if (pulseRef.current) { window.clearTimeout(pulseRef.current); pulseRef.current = null; }
      setPeriodic(false);
    };

    if (!hasUnread) {
      clearTimers();
      return;
    }

    timerRef.current = window.setInterval(() => {
      setPeriodic(true);
      pulseRef.current = window.setTimeout(() => setPeriodic(false), 820);
    }, 1000);

    return () => clearTimers();
  }, [hasUnread]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const el = containerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer as any);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        key={ringSeq}
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${(hasUnread && (ring || periodic)) ? 'bell-shake' : ''}`}
        aria-label={t('chat.notificationsBell.bellAria')}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {hasUnread && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center shadow-lg badge-bounce"
          >
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('chat.notificationsBell.title')}</p>
            <button
              onClick={() => { onClearAll?.(); }}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('chat.notificationsBell.markAllRead')}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {items.length === 0 && (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">{t('chat.notificationsBell.empty')}</div>
            )}
            {items.map((it) => (
              <div key={it.id} className="relative group">
                <div
                  onClick={() => { onItemClick(it.id); setOpen(false); }}
                  className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onItemClick(it.id); setOpen(false); } }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                    {it.avatar ? (
                      <img src={it.avatar} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      it.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('chat.notificationsBell.newMessagesCount', { count: it.count })}</p>
                  </div>
                  {it.count > 0 && (
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                      +{it.count}
                    </span>
                  )}
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev) => prev === it.id ? null : it.id); }}
                    aria-label={t('chat.menu.options')}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  {openMenuId === it.id && (
                    <div className="absolute right-0 mt-1 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={(e) => { e.stopPropagation(); onDeleteItem?.(it.id); setOpenMenuId(null); }}
                      >
                        {t('chat.notificationsBell.deleteItem', 'Delete notification')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
