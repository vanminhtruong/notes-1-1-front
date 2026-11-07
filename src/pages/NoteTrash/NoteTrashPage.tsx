import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Clock3,
  FileText, Info, LoaderCircle, RotateCcw, Search, Trash2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { noteTrashService, type TrashedNote } from '@/services/notesService';
import './NoteTrash.scss';

type Deletion =
  | { type: 'one'; id: number; title: string }
  | { type: 'selected'; ids: number[] }
  | { type: 'all' };

// Show pagination as soon as the trash contains more than five notes.
const PAGE_SIZE = 5;
const DAY_MS = 86_400_000;

export default function NoteTrashPage() {
  const { t, i18n } = useTranslation('noteTrash');
  const [notes, setNotes] = useState<TrashedNote[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [deletion, setDeletion] = useState<Deletion | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(input.trim());
      setPage(1);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [input]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const result = await noteTrashService.list({ page, limit: PAGE_SIZE, search: query });
      if (id !== requestId.current) return;
      setNotes(result.notes);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(1, result.pagination.totalPages));
      setSelected([]);
      if (page > 1 && result.notes.length === 0 && result.pagination.totalPages < page) {
        setPage(Math.max(1, result.pagination.totalPages));
      }
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : t('loadError'));
      setNotes([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, query, t]);

  useEffect(() => {
    void load();
    return () => { requestId.current++; };
  }, [load]);

  useEffect(() => {
    if (!deletion) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) setDeletion(null);
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [deletion, busy]);

  const dateText = (value: string) =>
    new Date(value).toLocaleDateString(i18n.resolvedLanguage || i18n.language, {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  const remainingDays = (expiresAt: string) =>
    Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS));

  const changePage = (nextPage: number) => {
    if (busy || loading || nextPage === page) return;
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const pageIds = useMemo(() => notes.map(note => note.id), [notes]);
  const selectedOnPage = pageIds.length > 0 && pageIds.every(id => selected.includes(id));

  const toggleAll = () => setSelected(selectedOnPage ? [] : [...pageIds]);
  const toggleOne = (id: number) =>
    setSelected(previous =>
      previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]
    );

  const restore = async (id: number) => {
    if (busy) return;
    setBusy(true);
    try {
      await noteTrashService.restore(id);
      toast.success(t('restored'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('operationError'));
    } finally {
      setBusy(false);
    }
  };

  const deleteConfirmed = async () => {
    if (!deletion || busy) return;
    setBusy(true);
    try {
      if (deletion.type === 'all') {
        await noteTrashService.empty();
      } else if (deletion.type === 'selected') {
        await noteTrashService.deleteSelected(deletion.ids);
      } else {
        await noteTrashService.deleteOne(deletion.id);
      }
      setDeletion(null);
      toast.success(t('deletedSuccess'));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('operationError'));
    } finally {
      setBusy(false);
    }
  };

  const deleteTitle = deletion?.type === 'one' ? t('deleteOneTitle')
    : deletion?.type === 'selected' ? t('deleteSelectedTitle', { count: deletion.ids.length })
      : t('deleteAllTitle');

  return (
    <div className="note-trash-page">
      <div className="nt-container">
        <nav className="nt-breadcrumb" aria-label={t('breadcrumb')}>
          <Link to="/dashboard" className="nt-back"><ArrowLeft size={17} />{t('back')}</Link>
          <ChevronRight size={15} aria-hidden="true" />
          <span aria-current="page">{t('title')}</span>
        </nav>

        <section className="nt-workspace" aria-labelledby="nt-title">
          <header className="nt-header">
            <div className="nt-header-primary">
              <div className="nt-hero-icon"><Trash2 size={25} strokeWidth={1.85} /></div>
              <div className="nt-heading">
                <h1 id="nt-title">{t('title')}</h1>
                <p>{t('subtitle')}</p>
              </div>
            </div>
            <div className="nt-retention" title={t('retentionTip')}>
              <Clock3 size={18} />
              <span><strong>30</strong> {t('days')}</span>
              <span className="nt-retention-label">{t('retention')}</span>
            </div>
          </header>

          <div className="nt-content">
            <div className="nt-toolbar">
              <label className="nt-search">
                <Search size={19} aria-hidden="true" />
                <input
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder={t('search')}
                  aria-label={t('search')}
                  type="search"
                />
              </label>
              <div className="nt-toolbar-actions">
                <span className="nt-count" aria-live="polite">
                  <FileText size={17} />
                  <strong>{total}</strong> {t('notesCount')}
                </span>
                <button
                  className="nt-button nt-button-outline-danger"
                  disabled={busy || loading || total === 0}
                  onClick={() => setDeletion({ type: 'all' })}
                  type="button"
                >
                  <Trash2 size={16} />{t('clear')}
                </button>
              </div>
            </div>

            <div className="nt-tip"><Info size={17} /><p>{t('hint')}</p></div>

            {selected.length > 0 ? (
              <div className="nt-selection-bar">
                <label className="nt-select-all">
                  <input type="checkbox" checked={selectedOnPage}
                    onChange={toggleAll} disabled={busy || loading} />
                  <span>{t('selectedCount', { count: selected.length })}</span>
                </label>
                <button type="button" disabled={busy || loading}
                  className="nt-button nt-button-danger"
                  onClick={() => setDeletion({ type: 'selected', ids: selected })}>
                  <Trash2 size={16} />{t('deleteSelected')}
                </button>
              </div>
            ) : (
              <div className="nt-list-header">
                <label className="nt-select-all">
                  <input type="checkbox" checked={selectedOnPage}
                    onChange={toggleAll} disabled={busy || loading || notes.length === 0} />
                  <span>{t('selectPage')}</span>
                </label>
                <span>{t('resultCount', { count: total })}</span>
              </div>
            )}

            {loading ? (
              <div className="nt-list nt-skeleton-list" aria-label={t('loading')} role="status">
                {Array.from({ length: 4 }, (_, index) => (
                  <div className="nt-skeleton-row" key={index}>
                    <span className="nt-skeleton nt-skeleton-icon" />
                    <div className="nt-skeleton-text">
                      <span className="nt-skeleton nt-skeleton-title" />
                      <span className="nt-skeleton nt-skeleton-meta" />
                    </div>
                    <span className="nt-skeleton nt-skeleton-action" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="nt-feedback" role="alert">
                <div className="nt-feedback-icon nt-error-icon"><Info size={30} /></div>
                <h2>{t('loadError')}</h2>
                <p>{error}</p>
                <button className="nt-button nt-button-primary" onClick={() => void load()}>
                  {t('retry')}
                </button>
              </div>
            ) : notes.length === 0 ? (
              <div className="nt-feedback">
                <div className="nt-feedback-icon"><Trash2 size={34} strokeWidth={1.5} /></div>
                <h2>{query ? t('noSearchResults') : t('empty')}</h2>
                <p>{query ? t('tryAnotherSearch') : t('emptyDesc')}</p>
                {query && <button className="nt-button nt-button-secondary"
                  onClick={() => { setInput(''); setQuery(''); setPage(1); }}>
                  <X size={16} />{t('clearSearch')}
                </button>}
              </div>
            ) : (
              <div className="nt-list" aria-label={t('title')}>
                {notes.map(note => {
                  const days = remainingDays(note.expiresAt);
                  return (
                    <article className="nt-note" key={note.id}>
                      <label className="nt-note-checkbox">
                        <input type="checkbox" checked={selected.includes(note.id)}
                          aria-label={t('selectNote', { title: note.title })}
                          disabled={busy} onChange={() => toggleOne(note.id)} />
                      </label>
                      <div className="nt-document-icon"><FileText size={21} strokeWidth={1.8} /></div>
                      <div className="nt-note-description">
                        <h2 title={note.title}>{note.title}</h2>
                        <div className="nt-note-date">
                          <CalendarDays size={14} /><span>{t('deletedAt')}: {dateText(note.deletedAt)}</span>
                        </div>
                      </div>
                      <div className="nt-expiry">
                        <span className={'nt-expiry-badge' + (days <= 7 ? ' nt-expiry-soon' : '')}>
                          <Clock3 size={13} />
                          {days === 0 ? t('expiresToday') : t('daysLeft', { count: days })}
                        </span>
                        <span className="nt-expiry-date">{t('expiresAt')}: {dateText(note.expiresAt)}</span>
                      </div>
                      <div className="nt-row-actions">
                        <button type="button" className="nt-button nt-button-restore"
                          disabled={busy} onClick={() => void restore(note.id)}>
                          {busy ? <LoaderCircle className="nt-spin" size={15} /> : <RotateCcw size={16} />}
                          {t('restore')}
                        </button>
                        <button type="button" className="nt-button nt-button-delete-icon"
                          disabled={busy} title={t('deleteForever')}
                          aria-label={t('deleteNote', { title: note.title })}
                          onClick={() => setDeletion({ type: 'one', id: note.id, title: note.title })}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!error && !loading && totalPages > 1 && (
              <footer className="nt-pagination">
                <span>{t('showing', {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                  total,
                })}</span>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={changePage}
                  className="nt-shared-pagination"
                />
              </footer>
            )}
          </div>
        </section>
      </div>

      {deletion && (
        <div className="nt-modal-backdrop" role="presentation"
          onMouseDown={event => { if (event.target === event.currentTarget && !busy) setDeletion(null); }}>
          <div className="nt-modal" role="alertdialog" aria-modal="true"
            aria-labelledby="nt-confirm-title" aria-describedby="nt-confirm-message">
            <div className="nt-modal-icon"><Trash2 size={23} /></div>
            <h2 id="nt-confirm-title">{deleteTitle}</h2>
            {deletion.type === 'one' && <p className="nt-modal-name">{deletion.title}</p>}
            <p id="nt-confirm-message">{t('deleteWarning')}</p>
            <div className="nt-modal-actions">
              <button type="button" className="nt-button nt-button-secondary"
                disabled={busy} onClick={() => setDeletion(null)}>{t('cancel')}</button>
              <button type="button" className="nt-button nt-button-danger"
                disabled={busy} onClick={() => void deleteConfirmed()}>
                {busy ? <LoaderCircle className="nt-spin" size={16} /> : <Check size={16} />}
                {t('confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
