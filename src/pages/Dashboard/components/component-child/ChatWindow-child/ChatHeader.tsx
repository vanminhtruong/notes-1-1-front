import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MessagesSquare, Search, Settings, Sprout, StickyNote, User, Users, X } from 'lucide-react';
import NotificationBell from '../../NotificationBell';
import { useTranslation } from 'react-i18next';
import type { ChatHeaderProps } from '../../interface/ChatHeader.interface';
import './chat-list-header.css';

type TabKey = ChatHeaderProps['activeTab'];

const ChatHeader = memo(({
  totalUnread,
  ring,
  ringSeq,
  notificationItems,
  notificationPagination,
  notificationLoading,
  searchTerm,
  activeTab,
  onClose,
  onItemClick,
  onClearAll,
  onItemDismissed,
  onLoadMoreNotifications,
  onSearchChange,
  onTabChange,
  onOpenSettings,
  showSettings
}: ChatHeaderProps) => {
  const { t, i18n } = useTranslation('dashboard');

  const tabs: { key: TabKey; label: string; Icon: typeof User }[] = [
    { key: 'chats', label: t('chat.header.tabs.all'), Icon: MessagesSquare },
    { key: 'users', label: t('chat.header.tabs.users'), Icon: User },
    { key: 'groups', label: t('chat.header.tabs.groups'), Icon: Users },
    { key: 'sharedNotes', label: t('sharedNotes.title'), Icon: StickyNote },
  ];

  // Sliding indicator for the active tab
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const [indicatorReady, setIndicatorReady] = useState(false);

  const measure = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (!el) {
      setIndicator(null);
      return;
    }
    setIndicator((prev) =>
      prev && prev.x === el.offsetLeft && prev.w === el.offsetWidth ? prev : { x: el.offsetLeft, w: el.offsetWidth }
    );
  }, [activeTab]);

  // Measure before paint so the indicator never flashes at the wrong spot.
  useLayoutEffect(() => {
    measure();
  }, [measure, showSettings, i18n.language]);

  // Enable the slide transition only after the first measurement.
  useEffect(() => {
    if (!indicator) {
      setIndicatorReady(false);
      return;
    }
    const id = requestAnimationFrame(() => setIndicatorReady(true));
    return () => cancelAnimationFrame(id);
  }, [indicator]);

  // Keep it correct on resize / label changes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure, showSettings]);

  // Bring the active tab into view when the strip scrolls (small screens).
  useEffect(() => {
    tabRefs.current[activeTab]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [activeTab, showSettings]);

  return (
    <div className="hd-root">
      <div className="hd-top">
        <div className="hd-brand">
          <span className="hd-mark" aria-hidden="true">
            <Sprout className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="hd-titles">
            <h1 className="hd-title">{t('chat.header.title')}</h1>
            <p className="hd-sub">PlantHub</p>
          </div>
        </div>

        <div className="hd-actions">
          <button
            type="button"
            onClick={onOpenSettings}
            className="hd-orb hd-orb--gear"
            aria-pressed={showSettings}
            aria-label={t('chat.header.settings', 'Cài đặt')}
            title={t('chat.header.settings', 'Cài đặt')}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <NotificationBell
            total={totalUnread}
            ring={ring}
            ringSeq={ringSeq}
            items={notificationItems}
            pagination={notificationPagination}
            isLoading={notificationLoading}
            onItemClick={onItemClick}
            onClearAll={onClearAll}
            onItemDismissed={onItemDismissed}
            onLoadMore={onLoadMoreNotifications}
          />
          <button
            type="button"
            onClick={onClose}
            className="hd-orb hd-orb--close"
            aria-label={t('actions.close', 'Đóng')}
            title={t('actions.close', 'Đóng')}
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {!showSettings && (
        <div className="hd-search">
          <span aria-hidden="true" className="hd-search-glow" />
          <div className="hd-search-box">
            <Search className="hd-search-icon h-[18px] w-[18px]" strokeWidth={2} />
            <input
              type="text"
              placeholder={t('chat.header.searchPlaceholder')}
              value={searchTerm}
              onFocus={() => onTabChange('users')}
              onChange={(e) => onSearchChange(e.target.value)}
              name="chat-search"
              id="chat-search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              inputMode="search"
              className="hd-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="hd-clear"
                onClick={() => onSearchChange('')}
                aria-label={t('actions.clear', 'Xóa')}
                title={t('actions.clear', 'Xóa')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {!showSettings && (
        <div className="hd-tabs">
          <div className="hd-tabs-track" ref={trackRef} role="tablist">
            <span
              aria-hidden="true"
              className="hd-tab-ind"
              data-ready={indicator ? String(indicatorReady) : 'false'}
              style={indicator ? { width: indicator.w, transform: `translateX(${indicator.x}px)` } : undefined}
            />
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                title={label}
                ref={(el) => { tabRefs.current[key] = el; }}
                onClick={() => onTabChange(key)}
                className="hd-tab"
              >
                <Icon className="h-[15px] w-[15px]" strokeWidth={2.1} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
