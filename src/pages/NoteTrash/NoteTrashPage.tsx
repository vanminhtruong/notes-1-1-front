import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Clock3,
  FileText, Info, LoaderCircle, RotateCcw, Search, Trash2, X,
} from 'lucide-react';
import Pagination from '@/components/Pagination';
import './NoteTrash.scss';
import { useNoteTrash } from './hooks/useNoteTrash';

export default function NoteTrashPage() {
  const { t } = useTranslation('noteTrash');
  const { notes, page, totalPages, total, input, setInput, query, setQuery, setPage, load, PAGE_SIZE, selected, deletion, setDeletion,
    busy, loading, error, dateText, remainingDays, changePage, selectedOnPage,
    toggleAll, toggleOne, restore, deleteConfirmed, deleteTitle } = useNoteTrash();

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
        <div className="nt-modal-backdrop" role="presentation">
          <div className="nt-modal" role="alertdialog" aria-modal="true"
            aria-labelledby="nt-confirm-title" aria-describedby="nt-confirm-message">
            <button
              type="button"
              className="nt-modal-close"
              onClick={() => setDeletion(null)}
              disabled={busy}
              title={t('close')}
              aria-label={t('close')}
            >
              <X size={19} strokeWidth={2} aria-hidden="true" />
            </button>
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
