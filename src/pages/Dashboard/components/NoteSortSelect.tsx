import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownUp, CalendarDays, Check, ChevronDown, Clock3, Flag, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NoteSortKey } from '../utils/noteSort';

interface NoteSortSelectProps {
  value: NoteSortKey;
  onChange: (value: NoteSortKey) => void;
}

const GROUPS = [
  {
    label: 'sort.groups.created',
    items: [
      { key: 'createdNewest', icon: CalendarDays },
      { key: 'createdOldest', icon: CalendarDays },
    ],
  },
  {
    label: 'sort.groups.updated',
    items: [
      { key: 'updatedNewest', icon: Clock3 },
      { key: 'updatedOldest', icon: Clock3 },
    ],
  },
  {
    label: 'sort.groups.name',
    items: [
      { key: 'titleAZ', icon: Type },
      { key: 'titleZA', icon: Type },
    ],
  },
  {
    label: 'sort.groups.priority',
    items: [
      { key: 'priorityHigh', icon: Flag },
      { key: 'priorityLow', icon: Flag },
    ],
  },
] as const;

const ORDER = GROUPS.flatMap(group => group.items.map(item => item.key));

const NoteSortSelect = memo(({ value, onChange }: NoteSortSelectProps) => {
  const { t } = useTranslation('dashboard');
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Partial<Record<NoteSortKey, HTMLButtonElement | null>>>({});
  const id = useId();
  const menuId = `dashboard-sort-menu-${id}`;

  const positionMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const gutter = 12;
    const width = Math.max(240, Math.min(390, window.innerWidth - gutter * 2));
    const left = Math.max(gutter, Math.min(rect.right - width, window.innerWidth - gutter - width));
    const below = window.innerHeight - rect.bottom - gutter - 8;
    const above = rect.top - gutter - 8;
    const upwards = below < 380 && above > below;
    const space = upwards ? above : below;
    const maxHeight = Math.min(490, Math.max(120, space));

    setMenuStyle({
      position: 'fixed',
      width,
      left,
      maxHeight,
      top: upwards ? undefined : rect.bottom + 8,
      bottom: upwards ? window.innerHeight - rect.top + 8 : undefined,
      visibility: 'visible',
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    positionMenu();

    const dismissOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const dismissEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);

    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => optionRefs.current[value]?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [open, value]);

  const select = (next: NoteSortKey) => {
    if (next !== value) onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }

    const current = ORDER.findIndex(key => optionRefs.current[key] === document.activeElement);
    let next = current;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % ORDER.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current + ORDER.length - 1) % ORDER.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ORDER.length - 1;
    else return;

    event.preventDefault();
    optionRefs.current[ORDER[next]]?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-label={`${t('sort.label')}: ${t(`sort.${value}`)}`}
        onClick={() => {
          if (!open) setMenuStyle({ visibility: 'hidden' });
          setOpen(previous => !previous);
        }}
        className={`group flex h-[52px] min-w-0 flex-[1_1_166px] items-center gap-2.5 rounded-xl border bg-white/95 px-3 text-left shadow-sm transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 dark:focus-visible:ring-neutral-400/25 sm:flex-none sm:w-[208px] dark:bg-neutral-900 ${open
          ? 'border-blue-400 ring-2 ring-blue-500/10 dark:border-neutral-500 dark:ring-neutral-500/15'
          : 'border-slate-200/90 hover:border-slate-300 hover:bg-white dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800'}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-200 dark:group-hover:bg-neutral-700">
          <ArrowDownUp aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-500 dark:text-neutral-400">
            {t('sort.label')}
          </span>
          <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-neutral-100">
            {t(`sort.${value}`)}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-neutral-400 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label={t('sort.label')}
          onKeyDown={handleMenuKeyDown}
          style={menuStyle}
          className="z-[10100] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/95 bg-white p-2.5 shadow-[0_18px_55px_-14px_rgba(15,23,42,0.26)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_18px_55px_-14px_rgba(0,0,0,0.62)]"
        >
          <div className="sticky top-[-10px] z-10 mb-1.5 flex items-center justify-between gap-2 rounded-xl border-b border-slate-100 bg-white px-2.5 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-5 text-slate-900 dark:text-neutral-100">{t('sort.menuTitle')}</p>
              <p className="text-[11px] leading-4 text-slate-500 dark:text-neutral-400">{t('sort.menuHint')}</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-600 dark:bg-neutral-800 dark:text-neutral-200">
              {ORDER.length}
            </span>
          </div>
          <div className="space-y-2.5 px-0.5 pb-0.5">
            {GROUPS.map(group => (
              <section key={group.label} role="group" aria-label={t(group.label)}>
                <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.11em] text-slate-500 dark:text-neutral-400">
                  {t(group.label)}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.items.map(({ key, icon: Icon }) => {
                    const selected = value === key;
                    return (
                      <button
                        key={key}
                        ref={element => { optionRefs.current[key] = element; }}
                        role="option"
                        aria-selected={selected}
                        type="button"
                        onClick={() => select(key)}
                        className={`group/option flex min-h-[62px] min-w-0 flex-col justify-between rounded-xl border px-2.5 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:focus-visible:ring-neutral-400/30 ${selected
                          ? 'border-blue-300 bg-blue-50/90 shadow-sm dark:border-neutral-500 dark:bg-neutral-700/55'
                          : 'border-slate-200/90 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/90 dark:border-neutral-700 dark:bg-neutral-800/55 dark:hover:border-neutral-500 dark:hover:bg-neutral-700/65'}`}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <Icon aria-hidden="true" className={`h-[15px] w-[15px] shrink-0 ${selected ? 'text-blue-600 dark:text-neutral-100' : 'text-slate-500 dark:text-neutral-400'}`} strokeWidth={1.8} />
                          {selected ? (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-neutral-200 dark:text-neutral-900">
                              <Check aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
                            </span>
                          ) : <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-neutral-600" aria-hidden="true" />}
                        </span>
                        <span className={`mt-2 block w-full break-words text-[12px] font-semibold leading-4 ${selected ? 'text-blue-800 dark:text-neutral-50' : 'text-slate-700 dark:text-neutral-200'}`}>
                          {t(`sort.${key}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
});

NoteSortSelect.displayName = 'NoteSortSelect';
export default NoteSortSelect;
