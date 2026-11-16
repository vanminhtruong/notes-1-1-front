import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { LockKeyhole, LockOpen, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Note } from '@/services/notesService';
import { notesService } from '@/services/notesService';
import { clearNoteForEncryption } from '@/offline/offlineNotes';
import { decryptNotePayload, encryptNotePayload, decryptMediaBytes, encryptMediaBytes, encryptionAvailable, type EncryptedMediaKind, type PrivateNotePayload } from '@/utils/noteEncryption';
import api from '@/services/api';
import { uploadService } from '@/services/uploadService';
import './NoteEncryptionDialog.scss';
import EditNoteModal, { type EditNote } from './EditNoteModal';
import { getHtmlPreview } from '@/utils/htmlUtils';

interface Props { note: Note; onClose: () => void; }

/**
 * Only browser memory contains a plaintext note or password, and only while open.
 * Never add this content to localStorage, logs, error telemetry or offline queues.
 */
export default function NoteEncryptionDialog({ note, onClose }: Props) {
  const { t } = useTranslation('dashboard');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState<PrivateNotePayload | null>(null);
  const [latest, setLatest] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditNote | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string; icon: string }>>([]);
  const pendingFilesRef = useRef<Partial<Record<EncryptedMediaKind, File>>>({});
  const newPreviewUrlsRef = useRef<string[]>([]);
  const [removeStep, setRemoveStep] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<Partial<Record<EncryptedMediaKind, string>>>({});
  const decryptedMediaRef = useRef<Partial<Record<EncryptedMediaKind, Blob>>>({});
  const objectUrlsRef = useRef<string[]>([]);
  const encrypted = !!note.isEncrypted;

  useEffect(() => {
    // This dialog is portaled into body: prevent the desktop behind it from scrolling.
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    const appRoot = document.getElementById('root');
    const previousRoot = appRoot?.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (appRoot) appRoot.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
      if (appRoot) appRoot.style.overflow = previousRoot || '';
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
      newPreviewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      newPreviewUrlsRef.current = [];
      pendingFilesRef.current = {};
      decryptedMediaRef.current = {};
    };
  }, []);

  function mediaSourceUrl(raw: string): string {
    if (/^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;
    const backend = new URL(api.defaults.baseURL || window.location.origin).origin;
    return new URL(raw, backend).href;
  }

  async function readOriginalMedia(source: string): Promise<Blob> {
    const response = await fetch(mediaSourceUrl(source), { cache: 'no-store' });
    if (!response.ok) throw new Error(t('e2ee.errors.mediaFetch', { status: response.status }));
    const blob = await response.blob();
    if (blob.size > 100 * 1024 * 1024) throw new Error(t('e2ee.errors.mediaTooLarge'));
    return blob;
  }

  async function uploadProtectedMedia(noteId: number, kind: EncryptedMediaKind, original: Blob, secret: string) {
    const encryptedBytes = await encryptMediaBytes(noteId, kind, original, secret);
    const id = await notesService.uploadEncryptedMedia(noteId, kind, encryptedBytes.ciphertext);
    return { id, salt: encryptedBytes.salt, iv: encryptedBytes.iv, type: original.type || 'application/octet-stream', name: kind };
  }

  function createDraft(current: Note, payload: PrivateNotePayload, urls: Partial<Record<EncryptedMediaKind, string>>): EditNote {
    const reminder = current.reminderAt ? new Date(current.reminderAt) : null;
    const reminderAtLocal = reminder && !Number.isNaN(reminder.getTime())
      ? new Date(reminder.getTime() - reminder.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
      : '';
    return {
      id: current.id,
      title: payload.title,
      content: payload.content,
      imageUrl: urls.image || '',
      videoUrl: urls.video || '',
      youtubeUrl: payload.youtubeUrl || '',
      backgroundImage: urls.background || '',
      categoryId: current.categoryId ?? undefined,
      priority: current.priority || 'medium',
      reminderAtLocal,
    };
  }

  function selectProtectedFile(kind: EncryptedMediaKind, file: File): string {
    if (file.size > 100 * 1024 * 1024) {
      toast.error(t('e2ee.errors.mediaTooLarge'));
      return '';
    }
    const url = URL.createObjectURL(file);
    newPreviewUrlsRef.current.push(url);
    pendingFilesRef.current[kind] = file;
    if (kind === 'image') delete pendingFilesRef.current.video;
    if (kind === 'video') delete pendingFilesRef.current.image;
    return url;
  }

  function removeProtectedFile(kind: EncryptedMediaKind) {
    delete pendingFilesRef.current[kind];
  }

  function openEdit() {
    if (!latest || !unlocked) return;
    pendingFilesRef.current = {};
    setDraft(createDraft(latest, unlocked, mediaUrls));
    setRemoveStep(false);
    setEditing(true);
  }

  function closeEdit() {
    pendingFilesRef.current = {};
    setEditing(false);
    setDraft(null);
  }

  function apiError(e: unknown) {
    const response = (e as { response?: { data?: { message?: string } } })?.response;
    const message = response?.data?.message || (e instanceof Error ? e.message : '');
    if (/Sai mật khẩu|Incorrect password|dữ liệu đã mã hóa bị hỏng/.test(message)) return t('e2ee.errors.invalidPassword');
    if (/Không thể giải mã tệp đính kèm/.test(message)) return t('e2ee.errors.invalidMedia');
    if (/chưa đồng bộ|unsynced offline/.test(message)) return t('e2ee.errors.offlinePending');
    return message || t('e2ee.errors.generic');
  }
  async function completeUpdate() {
    toast.success(t('e2ee.updated'));
    setPassword('');
    setConfirmation('');
    setUnlocked(null);
    onClose();
    // Clear all old note props, previews and socket-held copies from the UI.
    window.location.reload();
  }
  const encrypt = async () => {
    if (password.length < 4) { toast.error(t('e2ee.errors.passwordMin')); return; }
    if (password !== confirmation) { toast.error(t('e2ee.errors.confirmationMismatch')); return; }
    setBusy(true); setError('');
    try {
      if (!encryptionAvailable()) throw Error(t('e2ee.errors.secureContext'));
      const current = await notesService.getNoteForEncryption(note.id);
      if (current.isEncrypted) throw Error(t('e2ee.errors.alreadyEncrypted'));
      // Encrypt each attachment locally. The backend stores opaque encrypted bytes
      // outside its public/ directory and cannot decrypt or serve them anonymously.
      const originalMedia: Partial<Record<EncryptedMediaKind, string>> = {
        image: current.imageUrl || undefined,
        video: current.videoUrl || undefined,
        background: current.backgroundImage || undefined,
      };
      const refs: Partial<Record<EncryptedMediaKind, string>> = {};
      const media: PrivateNotePayload['media'] = {};
      for (const kind of ['image', 'video', 'background'] as const) {
        const source = originalMedia[kind];
        if (!source) continue;
        const original = await readOriginalMedia(source);
        const info = await uploadProtectedMedia(note.id, kind, original, password);
        media[kind] = info;
        refs[kind] = 'e2ee:' + info.id;
      }
      const payload: PrivateNotePayload = {
        title: current.title, content: current.content || '',
        media, youtubeUrl: current.youtubeUrl || null,
      };
      const ciphertext = await encryptNotePayload(note.id, payload, password);
      await clearNoteForEncryption(note.id);
      await notesService.changeEncryption(note.id, { action: 'encrypt', ciphertext, mediaRefs: refs, expectedUpdatedAt: current.updatedAt });
      await completeUpdate();
    } catch (e) { setError(apiError(e)); }
    finally { setBusy(false); }
  };
  const unlock = async () => {
    setBusy(true); setError('');
    try {
      const current = await notesService.getNoteForEncryption(note.id);
      if (!current.isEncrypted) throw Error(t('e2ee.errors.notEncrypted'));
      const plaintext = await decryptNotePayload(note.id, current.content || '', password);
      const decrypted: Partial<Record<EncryptedMediaKind, Blob>> = {};
      const urls: Partial<Record<EncryptedMediaKind, string>> = {};
      for (const kind of ['image', 'video', 'background'] as const) {
        const info = plaintext.media?.[kind];
        if (!info) continue;
        const data = await notesService.getEncryptedMedia(note.id, kind, info.id);
        const blob = await decryptMediaBytes(note.id, kind, data, info, password);
        decrypted[kind] = blob;
        const url = URL.createObjectURL(blob);
        urls[kind] = url;
        objectUrlsRef.current.push(url);
      }
      decryptedMediaRef.current = decrypted;
      setMediaUrls(urls);
      setLatest(current); setUnlocked(plaintext);
      setDraft(createDraft(current, plaintext, urls));
      void notesService.getCategories().then(result => {
        setCategories(result.categories.map(cat => ({ id: cat.id, name: cat.name, color: cat.color, icon: cat.icon })));
      }).catch(() => { /* The editor still works without category suggestions. */ });
    } catch (e) { setError(apiError(e)); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!latest || !unlocked || !draft || busy) return;
    if (!draft.title.trim() || draft.title.length > 200) {
      toast.error(t('e2ee.errors.invalidTitle')); return;
    }
    setBusy(true); setError('');
    try {
      const media: PrivateNotePayload['media'] = {};
      const refs: Partial<Record<EncryptedMediaKind, string | null>> = {
        image: null, video: null, background: null,
      };
      for (const kind of ['image', 'video', 'background'] as const) {
        const selected = kind === 'image' ? draft.imageUrl : kind === 'video' ? draft.videoUrl : draft.backgroundImage;
        if (!selected) continue;
        const pending = pendingFilesRef.current[kind];
        const info = pending ? await uploadProtectedMedia(note.id, kind, pending, password) : unlocked.media?.[kind];
        if (!info) throw new Error(t('e2ee.errors.invalidMedia'));
        media[kind] = info;
        refs[kind] = 'e2ee:' + info.id;
      }
      const payload: PrivateNotePayload = {
        title: draft.title.trim(),
        content: draft.content,
        youtubeUrl: draft.youtubeUrl.trim() || null,
        media,
      };
      const ciphertext = await encryptNotePayload(note.id, payload, password);
      await clearNoteForEncryption(note.id);
      await notesService.changeEncryption(note.id, {
        action: 'save', ciphertext, mediaRefs: refs,
        metadata: {
          categoryId: draft.categoryId ?? null,
          priority: draft.priority,
          reminderAt: draft.reminderAtLocal ? new Date(draft.reminderAtLocal).toISOString() : null,
        },
        expectedUpdatedAt: latest.updatedAt,
      });
      await completeUpdate();
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };
  const disable = async () => {
    if (!latest || !unlocked) return;
    setBusy(true); setError('');
    try {
      // Explicit opt-out: re-upload plaintext media only after confirmation.
      const publicMedia: { image?: string; video?: string; background?: string; youtube?: string | null } = {
        youtube: unlocked.youtubeUrl || null,
      };
      for (const kind of ['image', 'video', 'background'] as const) {
        const blob = decryptedMediaRef.current[kind];
        if (!blob) continue;
        const filename = kind + (blob.type.startsWith('image/') ? '.png' : blob.type.startsWith('video/') ? '.mp4' : '.bin');
        const file = new File([blob], filename, { type: blob.type });
        const result = kind === 'video' ? await uploadService.uploadFile(file) : await uploadService.uploadImage(file);
        publicMedia[kind] = result.url;
      }
      await notesService.changeEncryption(note.id, {
        action: 'decrypt', title: unlocked.title, content: unlocked.content,
        publicMedia, expectedUpdatedAt: latest.updatedAt
      });
      await completeUpdate();
    } catch (e) { setError(apiError(e)); }
    finally { setBusy(false); }
  };
  const smallButton = 'rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50';
  return <>
    {!editing && createPortal(
    <div className="note-e2ee-backdrop fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5" role="presentation"
      onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <section role="dialog" aria-modal="true" aria-labelledby="note-e2ee-title"
        className="note-e2ee-dialog w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-600 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="note-e2ee-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
              {encrypted ? <LockKeyhole size={20} /> : <ShieldCheck size={20} />}
            </span>
            <div>
              <h2 id="note-e2ee-title" className="text-base font-bold sm:text-lg">{encrypted ? t('e2ee.encryptedTitle') : t('e2ee.protectTitle')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">{encrypted ? t('e2ee.protectedSubtitle') : t('e2ee.encryptSubtitle')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('e2ee.close')} disabled={busy}
            className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700"><X size={18} /></button>
        </header>
        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-4 sm:p-5">
          {!encrypted && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t('e2ee.intro')}
              <strong className="mt-2 block">{t('e2ee.lostPassword')}</strong>
              {t('e2ee.mediaExplanation')}
              {t('e2ee.legacyWarning')}
            </p>
          )}
          {encrypted && !unlocked && (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-700/70 dark:text-slate-200">
              {t('e2ee.unlockInstruction')}
            </p>
          )}
          {(!encrypted || !unlocked) && (
            <form id="note-e2ee-password-form" className="space-y-3" onSubmit={e => { e.preventDefault(); void (encrypted ? unlock() : encrypt()); }}>
              <label className="block text-sm font-semibold">{t('e2ee.passwordLabel')}
                <input type="password" autoComplete="off" 
                  value={password} onChange={e => setPassword(e.target.value)} autoFocus
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-500 dark:bg-slate-900" />
              </label>
              {!encrypted && <label className="block text-sm font-semibold">{t('e2ee.confirmPasswordLabel')}
                <input type="password" autoComplete="off" value={confirmation}
                  onChange={e => setConfirmation(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-500 dark:bg-slate-900" />
              </label>}
            </form>
          )}
          {unlocked && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/50">
                <p className="mb-2 break-words text-base font-semibold">{unlocked.title}</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{getHtmlPreview(unlocked.content, 50_000) || t('e2ee.emptyContent')}</p>
                {mediaUrls.image && <img src={mediaUrls.image} alt={t('e2ee.photoAlt')} className="mt-3 max-h-64 w-full rounded-xl object-contain" />}
                {mediaUrls.video && <video src={mediaUrls.video} controls playsInline className="mt-3 max-h-64 w-full rounded-xl" />}
                {mediaUrls.background && <img src={mediaUrls.background} alt={t('e2ee.backgroundAlt')} className="mt-3 max-h-36 w-full rounded-xl object-contain" />}
                {unlocked.youtubeUrl && <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">{t('e2ee.youtubeLabel')} {unlocked.youtubeUrl}</p>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">{t('e2ee.temporaryHint')}</p>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
          {removeStep && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
            {t('e2ee.disableWarning')}
          </p>}
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-600">
            {unlocked ? (
              <>
                <button type="button" disabled={busy} onClick={() => { if (editing) closeEdit(); else openEdit(); }}
                  className={smallButton + ' border-slate-300 dark:border-slate-500'}>{editing ? t('e2ee.preview') : t('e2ee.edit')}</button>
                <button type="button" disabled={busy} onClick={() => { if (!removeStep) { setRemoveStep(true); return; } void disable(); }}
                  className={smallButton + ' border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-200'}>
                  {removeStep ? t('e2ee.confirmDisable') : <span className="inline-flex items-center gap-1"><LockOpen size={14} /> {t('e2ee.disable')}</span>}
                </button>
              </>
            ) : (
              <button type="submit" form="note-e2ee-password-form" disabled={busy}
                className={'note-e2ee-primary ' + smallButton + ' border-blue-700 bg-blue-700 text-white hover:bg-blue-800'}>
                {busy ? t('e2ee.working') : encrypted ? t('e2ee.unlock') : t('e2ee.enable')}
              </button>
            )}
          </footer>
        </div>
      </section>
    </div>,
    document.body
    )}
    {editing && draft && <EditNoteModal
      isOpen={true}
      onClose={closeEdit}
      editNote={draft}
      setEditNote={setDraft}
      onSubmit={() => void save()}
      categories={categories}
      secureMode={true}
      busy={busy}
      onProtectedFileSelected={selectProtectedFile}
      onProtectedMediaRemoved={removeProtectedFile}
    />}
  </>;
}
