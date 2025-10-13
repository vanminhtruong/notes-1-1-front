import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import type { NotificationBellProps } from './interface/NotificationBell.interface';

const NotificationBell = memo(({ total, ring, ringSeq, items, pagination, isLoading, onItemClick, onClearAll, onItemDismissed, onLoadMore }: NotificationBellProps) => {
  const { t } = useTranslation('dashboard');
  const [open, setOpen] = useState(false);
  const [periodic, setPeriodic] = useState(false);
  const timerRef = useRef<number | null>(null);
  const pulseRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [latestSeenMs, setLatestSeenMs] = useState<number>(0);

  const hasUnread = total > 0;

  // Latest item time across the feed — used to always show a dot for the newest item
  const latestTimeMs = useMemo(() => {
    try {
      let max = 0;
      for (const it of items || []) {
        const d = it && it.time ? new Date(it.time) : null;
        const ms = (d && !Number.isNaN(d.getTime())) ? d.getTime() : 0;
        if (ms > max) max = ms;
      }
      return max;
    } catch { return 0; }
  }, [items]);

  // Lightweight time formatter (relative within 24h, otherwise date+time)
  const formatTime = (value?: string | number | Date) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const now = Date.now();
    const diff = Math.max(0, now - d.getTime());
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h`;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const m2 = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${m2}`;
  };

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

  // Create a portal root for floating menus
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!portalRef.current) {
      const el = document.createElement('div');
      el.style.position = 'relative';
      el.style.zIndex = '9999';
      document.body.appendChild(el);
      portalRef.current = el;
    }
    return () => {
      try {
        if (portalRef.current && portalRef.current.parentNode) {
          portalRef.current.parentNode.removeChild(portalRef.current);
        }
      } catch {}
      portalRef.current = null;
    };
  }, []);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const el = containerRef.current;
      const portalEl = portalRef.current;
      if (el && e.target instanceof Node) {
        const insideDropdown = el.contains(e.target);
        const insidePortal = portalEl ? portalEl.contains(e.target as Node) : false;
        if (!insideDropdown && !insidePortal) {
          setOpen(false);
          setMenuOpenId(null);
        }
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setMenuOpenId(null); }
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

  // When dropdown closes, also close the floating menu
  useEffect(() => {
    if (!open) {
      setMenuOpenId(null);
    }
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
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-visible z-[60] md-down:right-auto md-down:left-1/2 md-down:-translate-x-1/2 md-down:w-[calc(100vw-3rem)] md-down:max-w-sm md-down:mt-3 md-down:rounded-2xl">
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('chat.notificationsBell.title')}</p>
            <button
              onClick={() => {
                try {
                  // Mark all current items as seen to hide glowing dots immediately
                  setLatestSeenMs(latestTimeMs || Date.now());
                } catch {}
                onClearAll?.();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('chat.notificationsBell.markAllRead')}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {items.length === 0 && !isLoading && (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">{t('chat.notificationsBell.empty')}</div>
            )}
            {isLoading && items.length === 0 && (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                {t('chat.notificationsBell.loading')}
              </div>
            )}
            {items.map((it, idx) => (
              <div key={it.id} className="relative group">
                <div
                  onClick={() => { onItemClick(it.id); setOpen(false); }}
                  className="w-full text-left flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{it.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {it.time && (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">{formatTime(it.time)}</span>
                        )}
                        {(() => {
                          const d = it.time ? new Date(it.time) : null;
                          const ms = (d && !Number.isNaN(d.getTime())) ? d.getTime() : 0;
                          // Extend window to 5 minutes for clearer visibility during usage
                          const recent = d ? (Date.now() - ms < 5 * 60 * 1000) : false;
                          const isLatest = latestTimeMs > 0 && ms === latestTimeMs;
                          const isFirst = idx === 0;
                          const showDot = hasUnread && (recent || isLatest || (latestTimeMs === 0 && isFirst)) && (ms > latestSeenMs);
                          return showDot ? (
                            <span
                              className="inline-block w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-400/70 animate-pulse"
                              style={{ boxShadow: '0 0 8px rgba(59,130,246,0.6)' }}
                              aria-label={t('chat.notificationsBell.new', 'Mới')}
                            />
                          ) : null;
                        })()}
                      </div>
                    </div>
                    {/* Removed count text as requested; using recent highlight for visual cue */}
                  </div>
                  {/* 3-dots menu trigger */}
                  <div className="absolute right-2 top-3">
                    <button
                      aria-label="More actions"
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        const target = e.currentTarget as HTMLButtonElement;
                        const rect = target.getBoundingClientRect();
                        const width = 144; // ~w-36
                        const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
                        const top = rect.top + rect.height + 6;
                        setMenuPos({ top, left });
                        setMenuOpenId(menuOpenId === it.id ? null : it.id);
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {pagination && pagination.hasNextPage && onLoadMore && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    onLoadMore();
                  }}
                  disabled={isLoading}
                  className="w-full py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      {t('chat.notificationsBell.loading')}
                    </div>
                  ) : (
                    t('chat.notificationsBell.loadMore', { remaining: pagination.totalItems - items.length })
                  )}
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
      {/* Portalized floating menu */}
      {menuOpenId !== null && menuPos && portalRef.current && createPortal(
        <div
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 10000 }}
          className="w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600"
            onClick={(e) => { e.stopPropagation(); const id = menuOpenId; setMenuOpenId(null); onItemDismissed?.(id!); }}
          >
            {t('chat.notificationsBell.deleteItem', 'Xóa thông báo')}
          </button>
        </div>,
        portalRef.current
      )}
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;

