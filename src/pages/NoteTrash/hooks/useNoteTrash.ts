import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { noteTrashService, type TrashedNote } from '@/services/notesService';

type Deletion =
  | { type: 'one'; id: number; title: string }
  | { type: 'selected'; ids: number[] }
  | { type: 'all' };

// Show pagination as soon as the trash contains more than five notes.
const PAGE_SIZE = 5;
const DAY_MS = 86_400_000;

export function useNoteTrash() {
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

  return { notes, page, totalPages, total, input, setInput, query, setQuery, setPage, load, PAGE_SIZE, selected, deletion, setDeletion,
    busy, loading, error, dateText, remainingDays, changePage, selectedOnPage,
    toggleAll, toggleOne, restore, deleteConfirmed, deleteTitle };
}
