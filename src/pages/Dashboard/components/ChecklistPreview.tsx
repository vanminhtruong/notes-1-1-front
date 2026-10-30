import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ListChecks, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { notesService } from '@/services/notesService';
import { useAppDispatch } from '@/store';
import { updateNoteRealtime } from '@/store/slices/notesSlice';
import { readChecklist, setChecklistItem } from '@/utils/checklist';

interface Props {
  noteId: number;
  content: string;
  compact: boolean;
  readOnly: boolean;
  onView: () => void;
  textClassName: string;
  hasBackground: boolean;
}

export default function ChecklistPreview({ noteId, content, compact, readOnly, onView, textClassName, hasBackground }: Props) {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const [html, setHtml] = useState(content);
  const [saving, setSaving] = useState<number | null>(null);
  const busy = useRef(false);
  useEffect(() => { setHtml(content); }, [noteId, content]);
  const { items, introduction } = useMemo(() => readChecklist(html), [html]);
  const completed = items.filter(item => item.checked).length;
  const limit = compact ? 2 : 4;

  const toggle = async (index: number, checked: boolean) => {
    if (busy.current || readOnly) return;
    busy.current = true;
    setSaving(index);
    try {
      const next = setChecklistItem(html, index, checked);
      const response = await notesService.updateNote(noteId, { content: next });
      setHtml(response.note.content);
      dispatch(updateNoteRealtime(response.note));
    } catch {
      toast.error(t('toasts.noteUpdateFailed'));
    } finally {
      busy.current = false;
      setSaving(null);
    }
  };

  return (
    <div className={`mb-4 space-y-2 text-sm ${textClassName}`}>
      {introduction && <p className="truncate" title={introduction}>{introduction}</p>}
      <div className={`rounded-xl border p-3 ${hasBackground ? 'bg-black/50 border-white/20 text-white backdrop-blur-md' : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700'}`} aria-busy={saving !== null}>
        <div className="flex items-center justify-between gap-2 text-xs mb-2">
          <span className="inline-flex items-center gap-1.5 font-medium"><ListChecks className="w-3.5 h-3.5" />{t('checklist.label')}</span>
          <span aria-live="polite">{t('checklist.progress', { completed, total: items.length })}</span>
        </div>
        <div role="progressbar" aria-label={t('checklist.label')} aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={completed} className="h-1 rounded-full bg-gray-300/40 dark:bg-gray-600/40 overflow-hidden mb-2">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completed / items.length * 100}%` }} />
        </div>
        <ul className="space-y-0.5">
          {items.slice(0, limit).map(item => (
            <li key={item.index}>
              <label className={`flex items-center gap-2 min-h-8 ${readOnly ? '' : 'cursor-pointer'}`}>
                <input type="checkbox" checked={item.checked} disabled={readOnly || saving !== null} onChange={() => void toggle(item.index, !item.checked)} className="sr-only peer" />
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 ${item.checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-400 dark:border-gray-500'}`}>
                  {saving === item.index ? <Loader2 className="h-3 w-3 animate-spin" /> : item.checked ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className={`truncate ${item.checked ? 'line-through opacity-60' : ''}`} title={item.text}>{item.text || t('checklist.untitled')}</span>
              </label>
            </li>
          ))}
        </ul>
        {items.length > limit && <button type="button" onClick={onView} className="mt-1 text-xs underline underline-offset-4 hover:opacity-80 focus-visible:outline focus-visible:outline-2">{t('checklist.more', { count: items.length - limit })}</button>}
      </div>
    </div>
  );
}
