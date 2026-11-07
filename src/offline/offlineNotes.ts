/**
 * Offline-first note storage / replay.
 *
 * Only a signed-in user's OWN notes are cached. Chat, shared notes, credentials,
 * and authenticated API responses are never put in the Service Worker cache.
 * Mutations are written to IndexedDB BEFORE the UI is told they were saved.
 *
 * Server currently has no idempotency key or compare-and-swap endpoint:
 * ambiguous POST responses are flagged for review (never blindly replayed).
 */
import api from '@/services/api';
import type {
  Note, CreateNoteData, UpdateNoteData, NotesResponse, NoteStats,
  FoldersResponse, FolderWithNotesResponse, CategoriesResponse, TagsResponse,
} from '@/services/notesService';

type Mode = 'pending' | 'conflict' | 'review' | 'failed';
type MutationType = 'create' | 'update' | 'delete';
export interface OfflineMutation {
  id: string;
  userId: number;
  noteId: number;
  type: MutationType;
  payload: CreateNoteData | UpdateNoteData | null;
  baseUpdatedAt: string | null;
  mode: Mode;
  reason?: string;
  queuedAt: string;
}
interface CachedNote { key: string; userId: number; note: Note }
interface MetaEntry { key: string; userId: number; data: unknown }
export interface OfflineStatus {
  online: boolean;
  syncing: boolean;
  pending: number;
  conflicts: number;
  review: number;
  failed: number;
  lastSync: string | null;
  cachedNotes: number;
}
type NoteQuery = {
  scope?: 'category'; page?: number; limit?: number; category?: string; priority?: string;
  search?: string; isArchived?: boolean; sortBy?: string; sortOrder?: 'ASC' | 'DESC';
};

const NAME = 'plant-notes-offline-v1';
const VERSION = 1;
const EVENT = 'plant:offline-notes-changed';
const CACHE_LIMIT = 10000;
let databasePromise: Promise<IDBDatabase> | null = null;
let currentSync: Promise<void> | null = null;
let remoteReachable = typeof navigator === 'undefined' ? true : navigator.onLine;
let checkedAt = 0;
let syncing = false;
let lastSync: string | null = null;
let lastWarmAt = 0;
let warmPromise: Promise<void> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB không khả dụng trên trình duyệt này'));
  if (databasePromise) return databasePromise;
  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('operations')) db.createObjectStore('operations', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error ?? new Error('Không mở được bộ nhớ ngoại tuyến'));
    request.onblocked = () => reject(new Error('Hãy đóng các tab cũ để nâng cấp bộ nhớ ngoại tuyến'));
  }).catch(error => { databasePromise = null; throw error; });
  return databasePromise;
}
function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Lỗi IndexedDB'));
  });
}
async function all<T>(store: 'notes' | 'operations' | 'meta'): Promise<T[]> {
  const db = await openDatabase();
  return requestResult(db.transaction(store, 'readonly').objectStore(store).getAll());
}
async function byKey<T>(store: 'notes' | 'operations' | 'meta', key: IDBValidKey): Promise<T | undefined> {
  const db = await openDatabase();
  return requestResult(db.transaction(store, 'readonly').objectStore(store).get(key));
}
async function writeBatch(notes: CachedNote[] = [], operations: OfflineMutation[] = [], removeNotes: string[] = [], removeOps: string[] = [], metadata: MetaEntry[] = []): Promise<void> {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['notes', 'operations', 'meta'], 'readwrite');
    const noteStore = tx.objectStore('notes');
    const opStore = tx.objectStore('operations');
    const metaStore = tx.objectStore('meta');
    for (const row of notes) noteStore.put(row);
    for (const op of operations) opStore.put(op);
    for (const key of removeNotes) noteStore.delete(key);
    for (const key of removeOps) opStore.delete(key);
    for (const entry of metadata) metaStore.put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Không lưu được dữ liệu offline'));
    tx.onabort = () => reject(tx.error ?? new Error('Giao dịch IndexedDB đã bị hủy'));
  });
}
function key(userId: number, noteId: number) { return userId + ':' + noteId; }
function metaKey(userId: number, name: string) { return userId + ':' + name; }
function uid(): number | null {
  if (typeof localStorage === 'undefined' || !localStorage.getItem('token')) return null;
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const id = Number(u.id);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch { return null; }
}
function me(): Note['user'] {
  try {
    const data = JSON.parse(localStorage.getItem('user') || '{}');
    return { id: Number(data.id), name: data.name || '', email: data.email || '', avatar: data.avatar || null };
  } catch { return { id: uid() || 0, name: '', email: '' }; }
}
function requireUser(): number {
  const id = uid();
  if (!id) throw new Error('Cần đăng nhập để sử dụng ghi chú offline');
  return id;
}
function isNetworkFailure(e: unknown): boolean {
  const error = e as { response?: { status?: number }; code?: string; message?: string };
  return !error?.response && (typeof navigator !== 'undefined' && !navigator.onLine || !!error?.code || /network|timeout|fetch|failed/i.test(error?.message || ''));
}
function broadcast() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
  try { channel?.postMessage('changed'); } catch { /* BroadcastChannel unavailable */ }
}
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(NAME) : null;
if (channel) channel.onmessage = () => window.dispatchEvent(new Event(EVENT));
export function onOfflineNotesChange(handler: () => void) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && (!navigator.onLine || !remoteReachable);
}
export async function checkConnection(force = false): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    remoteReachable = false; checkedAt = Date.now(); broadcast(); return false;
  }
  if (!force && checkedAt && Date.now() - checkedAt < 8000) return remoteReachable;
  try {
    // Safe read-only probe; never send a mutation if server is unreachable.
    await api.get('/notes', { params: { page: 1, limit: 1 }, timeout: 4500 });
    remoteReachable = true;
  } catch (error) {
    if (!isNetworkFailure(error)) {
      // A reachable server with 401/403 is not "offline".
      remoteReachable = true;
    } else remoteReachable = false;
  }
  checkedAt = Date.now();
  broadcast();
  return remoteReachable;
}
export async function operationsForUser(userId = uid()): Promise<OfflineMutation[]> {
  if (!userId) return [];
  const records = await all<OfflineMutation>('operations');
  return records.filter(row => row.userId === userId).sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
}
async function notesForUser(userId: number): Promise<Note[]> {
  const rows = await all<CachedNote>('notes');
  return rows.filter(row => row.userId === userId).map(row => row.note);
}
async function cachedNote(userId: number, id: number): Promise<Note | null> {
  return (await byKey<CachedNote>('notes', key(userId, id)))?.note || null;
}
function formatQuery(notes: Note[], p: NoteQuery = {}): NotesResponse {
  const page = Math.max(1, Math.floor(p.page || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(p.limit || 9)));
  const categoryScope = p.scope === 'category' && !!p.category;
  const matches = notes.filter(n => {
    if (!categoryScope) {
      if (n.isArchived !== Boolean(p.isArchived)) return false;
      if (!p.isArchived && n.folderId != null) return false;
    }
    if (p.category && n.categoryId !== Number(p.category)) return false;
    if (p.priority && n.priority !== p.priority) return false;
    if (p.search) {
      const search = p.search.toLocaleLowerCase();
      if (!(n.title || '').toLocaleLowerCase().includes(search) &&
          !(n.content || '').toLocaleLowerCase().includes(search)) return false;
    }
    return true;
  });
  const direction = p.sortOrder === 'ASC' ? 1 : -1;
  const sortBy = p.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt';
  matches.sort((a, b) => Number(b.isPinned) - Number(a.isPinned) ||
    direction * ((new Date(a[sortBy]).getTime() || 0) - (new Date(b[sortBy]).getTime() || 0)));
  return {
    notes: matches.slice((page - 1) * limit, page * limit),
    pagination: { total: matches.length, page, limit, totalPages: Math.ceil(matches.length / limit) },
  };
}
async function cacheAuthoritativeSnapshot(notes: Note[], userId: number): Promise<void> {
  if ((await operationsForUser(userId)).length) return; // Do not erase dirty records.
  const snapshot = new Map(notes.filter(n => n.userId === userId).map(n => [n.id, n]));
  const previous = await all<CachedNote>('notes');
  const removed = previous.filter(r => r.userId === userId && !snapshot.has(r.note.id)).map(r => r.key);
  await writeBatch([...snapshot.values()].map(note => ({ key: key(userId, note.id), userId, note })),
    [], removed);
  broadcast();
}
async function cacheServerNotes(notes: Note[]): Promise<void> {
  const userId = uid();
  if (!userId) return;
  const ours = notes.filter(n => n.userId === userId);
  if (!ours.length) return;
  const pending = new Set((await operationsForUser(userId)).map(x => x.noteId));
  const eligible = ours.filter(n => !pending.has(n.id)).map(note => ({ key: key(userId, note.id), userId, note }));
  if (eligible.length) { await writeBatch(eligible); broadcast(); }
}
async function cacheMeta(name: string, data: unknown): Promise<void> {
  const userId = uid();
  if (!userId) return;
  await writeBatch([], [], [], [], [{ key: metaKey(userId, name), userId, data }]);
}
async function readMeta<T>(name: string): Promise<T | null> {
  const userId = uid();
  return userId ? ((await byKey<MetaEntry>('meta', metaKey(userId, name)))?.data as T || null) : null;
}
export async function getNotes(params: NoteQuery = {}): Promise<NotesResponse> {
  const userId = requireUser();
  if (!isOffline()) {
    try {
      const response = await api.get<NotesResponse>('/notes', { params });
      void cacheServerNotes(response.data.notes).catch(console.warn);
      const queued = await operationsForUser(userId).catch(() => []);
      // Preserve local drafts and dirty records during active replay.
      if (queued.length) {
        const local = await notesForUser(userId).catch(() => []);
        if (local.length) return formatQuery(local, params);
      }
      return response.data;
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  return formatQuery(await notesForUser(userId), params);
}
export async function getNoteById(id: number): Promise<{ note: Note }> {
  const userId = requireUser();
  if (!isOffline() && id > 0) {
    try {
      const response = await api.get<{ note: Note }>('/notes/' + id);
      try { await cacheServerNotes([response.data.note]); } catch (error) {
        console.warn('[Offline] Cannot cache note:', error);
      }
      const dirty = (await operationsForUser(userId).catch(() => [])).some(op => op.noteId === id);
      if (!dirty) return response.data;
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  const note = await cachedNote(userId, id);
  if (!note) throw new Error('Ghi chú chưa được lưu trên thiết bị để dùng offline');
  return { note };
}
function makeLocalNote(data: CreateNoteData, userId: number): Note {
  const timestamp = new Date().toISOString();
  const random = new Uint32Array(1);
  if (typeof crypto !== 'undefined') crypto.getRandomValues(random);
  const id = -(Date.now() * 1000 + (random[0] % 1000));
  return {
    id, userId, title: data.title, content: data.content || '',
    imageUrl: data.imageUrl || null, videoUrl: data.videoUrl || null,
    youtubeUrl: data.youtubeUrl || null, categoryId: data.categoryId || null,
    priority: data.priority || 'medium', isArchived: false, isPinned: false,
    reminderAt: data.reminderAt || null, reminderSent: false, reminderAcknowledged: false,
    createdAt: timestamp, updatedAt: timestamp,
    user: me(),
  };
}
function opId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now() + ':' + Math.random();
}
async function stageCreate(data: CreateNoteData, review = false): Promise<{ message: string; note: Note; offline: true }> {
  const userId = requireUser();
  if (data.sharedFromUserId) throw new Error('Tạo ghi chú thay người khác cần kết nối mạng');
  const note = makeLocalNote(data, userId);
  const op: OfflineMutation = {
    id: opId(), userId, noteId: note.id, type: 'create', payload: data,
    baseUpdatedAt: null, mode: review ? 'review' : 'pending',
    reason: review ? 'Kết nối bị ngắt sau khi gửi yêu cầu tạo. Hãy kiểm tra trên server trước khi gửi lại.' : undefined,
    queuedAt: new Date().toISOString(),
  };
  await writeBatch([{ key: key(userId, note.id), userId, note }], [op]);
  broadcast();
  return { message: 'Đã lưu trên thiết bị, chờ đồng bộ', note, offline: true };
}
async function stageMutation(id: number, type: 'update' | 'delete', patch?: UpdateNoteData): Promise<{ message: string; note?: Note; offline: true }> {
  const userId = requireUser();
  const note = await cachedNote(userId, id);
  if (!note) throw new Error('Ghi chú này chưa được tải về để chỉnh sửa offline');
  if (note.userId !== userId) throw new Error('Chỉ ghi chú của bạn mới được phép chỉnh sửa offline');
  const ops = await operationsForUser(userId);
  const existing = ops.filter(op => op.noteId === id);
  const original = existing[0];
  const now = new Date().toISOString();
  if (type === 'delete') {
    if (original?.type === 'create') {
      // A local-only draft can simply be removed without ever hitting server.
      await writeBatch([], [], [key(userId, id)], existing.map(x => x.id));
    } else {
      const op: OfflineMutation = {
        id: original?.id || opId(), userId, noteId: id, type: 'delete',
        payload: null, baseUpdatedAt: original?.baseUpdatedAt || note.updatedAt,
        mode: 'pending', queuedAt: original?.queuedAt || now,
      };
      await writeBatch([], [op], [key(userId, id)], existing.filter(x => x.id !== op.id).map(x => x.id));
    }
    broadcast();
    return { message: 'Sẽ chuyển vào thùng rác khi có mạng', offline: true };
  }

  const next = { ...note, ...patch, updatedAt: now };
  if (original?.type === 'create') {
    // Edits to a still-local note become part of its one eventual POST.
    const merged = { ...(original.payload as CreateNoteData), ...patch } as CreateNoteData;
    await writeBatch([{ key: key(userId, id), userId, note: next }], [{ ...original, payload: merged }]);
  } else {
    const op: OfflineMutation = {
      id: original?.id || opId(), userId, noteId: id, type: 'update',
      payload: { ...(original?.payload || {}), ...(patch || {}) } as UpdateNoteData,
      baseUpdatedAt: original?.baseUpdatedAt || note.updatedAt,
      mode: 'pending', queuedAt: original?.queuedAt || now,
    };
    await writeBatch([{ key: key(userId, id), userId, note: next }], [op],
      [], existing.filter(x => x.id !== op.id).map(x => x.id));
  }
  broadcast();
  return { message: 'Đã lưu trên thiết bị, chờ đồng bộ', note: next, offline: true };
}
async function ensureConnected(): Promise<boolean> {
  return !isOffline() || await checkConnection(true);
}
export async function createNote(data: CreateNoteData): Promise<{ message: string; note: Note; offline?: true }> {
  requireUser();
  if (!(await ensureConnected())) return stageCreate(data);
  // If older queued changes exist, preserve their server ordering.
  if ((await operationsForUser().catch(() => [])).length) return stageCreate(data);
  try {
    const response = await api.post<{ message: string; note: Note }>('/notes', data);
    try { await cacheServerNotes([response.data.note]); } catch (error) {
      console.warn('[Offline] Could not cache server response:', error);
    }
    return response.data;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    remoteReachable = false; checkedAt = Date.now(); broadcast();
    return stageCreate(data, true);
  }
}
export async function updateNote(id: number, data: UpdateNoteData): Promise<{ message: string; note: Note; offline?: true }> {
  requireUser();
  if (id <= 0 || (await operationsForUser().catch(() => [])).some(op => op.noteId === id) || !(await ensureConnected())) {
    const res = await stageMutation(id, 'update', data);
    return { message: res.message, note: res.note!, offline: true };
  }
  try {
    const response = await api.put<{ message: string; note: Note }>('/notes/' + id, data);
    try { await cacheServerNotes([response.data.note]); } catch (error) {
      console.warn('[Offline] Could not cache server response:', error);
    }
    return response.data;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    remoteReachable = false; checkedAt = Date.now(); broadcast();
    const res = await stageMutation(id, 'update', data);
    return { message: res.message, note: res.note!, offline: true };
  }
}
export async function deleteNote(id: number): Promise<{ message: string; offline?: true }> {
  requireUser();
  if (id <= 0 || (await operationsForUser().catch(() => [])).some(op => op.noteId === id) || !(await ensureConnected())) {
    const res = await stageMutation(id, 'delete');
    return { message: res.message, offline: true };
  }
  try {
    const response = await api.delete<{ message: string }>('/notes/' + id);
    const userId = requireUser();
    try { await writeBatch([], [], [key(userId, id)]); broadcast(); }
    catch (error) { console.warn('[Offline] Could not update local cache:', error); }
    return response.data;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    remoteReachable = false; checkedAt = Date.now(); broadcast();
    const res = await stageMutation(id, 'delete');
    return { message: res.message, offline: true };
  }
}
export async function archiveNote(id: number): Promise<{ message: string; note: Note; offline?: true }> {
  requireUser();
  const userId = requireUser();
  if (id <= 0 || (await operationsForUser().catch(() => [])).some(op => op.noteId === id) || !(await ensureConnected())) {
    const note = await cachedNote(userId, id);
    if (!note) throw new Error('Hãy mở ghi chú khi có mạng một lần trước khi lưu offline');
    const res = await stageMutation(id, 'update', { isArchived: !note.isArchived });
    return { message: res.message, note: res.note!, offline: true };
  }
  try {
    const res = await api.patch<{ message: string; note: Note }>('/notes/' + id + '/archive');
    await cacheServerNotes([res.data.note]);
    return res.data;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    remoteReachable = false; checkedAt = Date.now(); broadcast();
    const note = await cachedNote(userId, id);
    if (!note) throw error;
    const res = await stageMutation(id, 'update', { isArchived: !note.isArchived });
    return { message: res.message, note: res.note!, offline: true };
  }
}
export async function deleteMany(ids: number[]): Promise<{ message: string; deletedIds: number[]; deletedCount: number; offline?: true }> {
  if (!ids.length) return { message: '', deletedIds: [], deletedCount: 0 };
  requireUser();
  if (!(await ensureConnected()) || ids.some(id => id <= 0) || (await operationsForUser().catch(() => [])).length > 0) {
    // Validate all local copies before any mutation to avoid partial batches.
    const userId = requireUser();
    for (const id of ids) if (!(await cachedNote(userId, id))) throw new Error('Một số ghi chú chưa lưu offline');
    for (const id of ids) await stageMutation(id, 'delete');
    return { message: 'Đã xếp hàng xóa khi trực tuyến', deletedIds: ids, deletedCount: ids.length, offline: true };
  }
  try {
    const res = await api.post<{ message: string; deletedIds: number[]; deletedCount: number }>('/notes/trash/move-selected', { ids });
    const userId = requireUser();
    try { await writeBatch([], [], res.data.deletedIds.map(id => key(userId, id))); broadcast(); }
    catch (error) { console.warn('[Offline] Could not update local cache:', error); }
    return res.data;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    remoteReachable = false; checkedAt = Date.now(); broadcast();
    const userId = requireUser();
    for (const id of ids) if (!(await cachedNote(userId, id))) throw error;
    for (const id of ids) await stageMutation(id, 'delete');
    return { message: 'Đã xếp hàng xóa khi trực tuyến', deletedIds: ids, deletedCount: ids.length, offline: true };
  }
}
export async function getStats(): Promise<NoteStats> {
  if (!isOffline()) {
    try {
      const result = await api.get<NoteStats>('/notes/stats');
      try { await cacheMeta('stats', result.data); } catch (error) {
        console.warn('[Offline] Could not cache stats:', error);
      }
      if (!(await operationsForUser().catch(() => [])).length) return result.data;
    } catch (error) {
      if (!isNetworkFailure(error)) throw error;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  const notes = await notesForUser(requireUser());
  const active = notes.filter(n => !n.isArchived && n.folderId == null);
  const archived = notes.filter(n => n.isArchived);
  const byPriority = ['low', 'medium', 'high'].map(priority => ({ priority, count: active.filter(n => n.priority === priority).length }));
  const byCategory = [...new Set(active.map(n => n.categoryId).filter(Boolean))].map(category => ({
    category: String(category), count: active.filter(n => String(n.categoryId) === String(category)).length,
  }));
  return { stats: {
    total: archived.length + active.length, active: active.length, archived: archived.length,
    byPriority, byCategory,
  }};
}
export async function getFolders(): Promise<FoldersResponse> {
  if (!isOffline()) {
    try {
      const res = await api.get<FoldersResponse>('/notes/folders');
      try { await cacheMeta('folders', res.data); } catch (error) { console.warn('[Offline] Folder cache:', error); }
      return res.data;
    } catch (e) {
      if (!isNetworkFailure(e)) throw e;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  return (await readMeta<FoldersResponse>('folders')) || { folders: [], total: 0 };
}
export async function getFolderById(folderId: number, params: { page?: number; limit?: number } = {}): Promise<FolderWithNotesResponse> {
  const userId = requireUser();
  if (!isOffline()) {
    try {
      const res = await api.get<FolderWithNotesResponse>('/notes/folders/' + folderId, { params });
      await cacheServerNotes(res.data.notes);
      return res.data;
    } catch (e) {
      if (!isNetworkFailure(e)) throw e;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  const folders = await readMeta<FoldersResponse>('folders');
  const folder = folders?.folders.find(item => item.id === folderId);
  if (!folder) throw new Error('Thư mục chưa được lưu offline');
  const notes = (await notesForUser(userId)).filter(n => n.folderId === folderId && !n.isArchived);
  const page = Math.max(1, params.page || 1), limit = Math.max(1, params.limit || 9);
  return {
    folder, notes: notes.slice((page - 1) * limit, page * limit),
    pagination: { total: notes.length, page, limit, totalPages: Math.ceil(notes.length / limit) },
  };
}
export async function getCategories(): Promise<CategoriesResponse> {
  if (!isOffline()) {
    try {
      const res = await api.get<CategoriesResponse>('/notes/categories');
      try { await cacheMeta('categories', res.data); } catch (error) { console.warn('[Offline] Categories cache:', error); }
      return res.data;
    } catch (e) {
      if (!isNetworkFailure(e)) throw e;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  return (await readMeta<CategoriesResponse>('categories')) || { categories: [], total: 0 };
}
export async function getTags(): Promise<TagsResponse> {
  if (!isOffline()) {
    try {
      const res = await api.get<TagsResponse>('/notes/tags');
      try { await cacheMeta('tags', res.data); } catch (error) { console.warn('[Offline] Tags cache:', error); }
      return res.data;
    } catch (e) {
      if (!isNetworkFailure(e)) throw e;
      remoteReachable = false; checkedAt = Date.now(); broadcast();
    }
  }
  return (await readMeta<TagsResponse>('tags')) || { tags: [], total: 0 };
}
export async function currentStatus(): Promise<OfflineStatus> {
  const ops = await operationsForUser();
  return {
    online: !isOffline(), syncing, pending: ops.length,
    conflicts: ops.filter(x => x.mode === 'conflict').length,
    review: ops.filter(x => x.mode === 'review').length,
    failed: ops.filter(x => x.mode === 'failed').length,
    lastSync: lastSync || await readMeta<string>('lastSync'),
    cachedNotes: (await notesForUser(requireUser())).length,
  };
}
export async function resolveOperation(id: string, action: 'retry' | 'discard' | 'overwrite'): Promise<void> {
  const userId = requireUser();
  const op = (await operationsForUser(userId)).find(row => row.id === id);
  if (!op) return;
  if (action === 'discard') {
    // On discard, restore server version locally if possible. Never delete a
    // local create without explicit user action.
    if (op.type === 'create') {
      await writeBatch([], [], [key(userId, op.noteId)], [op.id]);
    } else {
      let remote: Note | null = null;
      if (navigator.onLine) {
        try {
          const response = await api.get<{ note: Note }>('/notes/' + op.noteId);
          remote = response.data.note;
        } catch (e) {
          if ((e as { response?: { status?: number } }).response?.status !== 404) throw e;
        }
      }
      await writeBatch(remote ? [{ key: key(userId, op.noteId), userId, note: remote }] : [],
        [], remote ? [] : [key(userId, op.noteId)], [op.id]);
    }
  } else {
    const next = { ...op, mode: 'pending' as Mode, reason: undefined };
    if (action === 'overwrite' && op.type !== 'create') {
      const remote = await api.get<{ note: Note }>('/notes/' + op.noteId);
      next.baseUpdatedAt = remote.data.note.updatedAt;
    }
    await writeBatch([], [next]);
  }
  broadcast();
}
export async function syncPending(): Promise<void> {
  if (currentSync) return currentSync;
  const userId = uid();
  if (!userId || !(await checkConnection(true))) return;
  const run = async () => {
    let applied = 0;
    syncing = true; broadcast();
    try {
      const process = async () => {
        const operations = await operationsForUser(userId);
        for (const op of operations) {
          if (uid() !== userId || !navigator.onLine) break;
          if (op.mode !== 'pending') break; // Resolve failures and conflicts explicitly.
          try {
            if (op.type !== 'create') {
              let server: Note;
              try {
                server = (await api.get<{ note: Note }>('/notes/' + op.noteId)).data.note;
              } catch (error) {
                if ((error as { response?: { status?: number } }).response?.status === 404) {
                  await writeBatch([], [{ ...op, mode: 'conflict', reason: 'Ghi chú đã bị xóa trên server.' }]);
                  broadcast(); break;
                }
                throw error;
              }
              if (server.updatedAt !== op.baseUpdatedAt) {
                await writeBatch([], [{ ...op, mode: 'conflict', reason: 'Ghi chú đã thay đổi trên server khi bạn offline.' }]);
                broadcast(); break;
              }
            }

            if (op.type === 'create') {
              const response = await api.post<{ note: Note }>('/notes', op.payload, { headers: { 'X-Offline-Operation-Id': op.id } });
              if (uid() !== userId) break;
              await writeBatch([{ key: key(userId, response.data.note.id), userId, note: response.data.note }],
                [], [key(userId, op.noteId)], [op.id]);
            } else if (op.type === 'update') {
              const response = await api.put<{ note: Note }>('/notes/' + op.noteId, op.payload, { headers: { 'X-Offline-Operation-Id': op.id } });
              if (uid() !== userId) break;
              await writeBatch([{ key: key(userId, op.noteId), userId, note: response.data.note }], [], [], [op.id]);
            } else {
              await api.delete('/notes/' + op.noteId, { headers: { 'X-Offline-Operation-Id': op.id } });
              if (uid() !== userId) break;
              await writeBatch([], [], [], [op.id]);
            }
            lastSync = new Date().toISOString();
            void cacheMeta('lastSync', lastSync).catch(console.warn);
            applied++;
            broadcast();
          } catch (error) {
            if (isNetworkFailure(error)) {
              remoteReachable = false; checkedAt = Date.now();
              // A server may have applied the mutation even if its response was lost:
              // do not blindly retry; users must explicitly review this operation.
              await writeBatch([], [{ ...op, mode: 'review',
                reason: 'Mất kết nối trong lúc đồng bộ. Kiểm tra dữ liệu trên server rồi thử lại để tránh trùng.' }]);
            } else {
              await writeBatch([], [{ ...op, mode: 'failed',
                reason: (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
                  (error as Error)?.message || 'Server từ chối đồng bộ' }]);
            }
            broadcast(); break;
          }
        }
      };
      if ('locks' in navigator && navigator.locks) {
        await navigator.locks.request('plant-offline-sync-' + userId, { ifAvailable: true }, async lock => {
          if (lock) await process();
        });
      } else await process();
    } finally {
      syncing = false; broadcast();
      if (applied > 0) window.dispatchEvent(new Event('plant:offline-notes-synced'));
    }
  };
  currentSync = run().finally(() => { currentSync = null; });
  return currentSync;
}
export async function warmOfflineCache(): Promise<void> {
  const userId = uid();
  if (!userId || isOffline() || warmPromise || Date.now() - lastWarmAt < 120000) return;
  if ((await operationsForUser(userId)).length) return; // Never overwrite local work.
  warmPromise = (async () => {
    let allNotes: Note[] = [];
    for (const isArchived of [false, true]) {
      for (let page = 1; page <= 100; page++) {
        if (uid() !== userId || !navigator.onLine) return;
        const result = await api.get<NotesResponse>('/notes', { params: { isArchived, page, limit: 100 } });
        allNotes.push(...result.data.notes);
        if (allNotes.length >= CACHE_LIMIT || page >= result.data.pagination.totalPages) break;
      }
    }
    const folders = await getFolders();
    for (const folder of folders.folders.slice(0, 100)) {
      for (let page = 1; page <= 50 && allNotes.length < CACHE_LIMIT; page++) {
        if (uid() !== userId || !navigator.onLine) return;
        const result = await api.get<FolderWithNotesResponse>('/notes/folders/' + folder.id, { params: { page, limit: 100 } });
        allNotes.push(...result.data.notes);
        if (page >= result.data.pagination.totalPages) break;
      }
    }
    if (uid() !== userId) return;
    if (!(await operationsForUser(userId)).length && allNotes.length < CACHE_LIMIT) {
      await cacheAuthoritativeSnapshot(allNotes, userId);
    } else {
      await cacheServerNotes(allNotes);
    }
    await getCategories();
    await getTags();
    lastWarmAt = Date.now();
    broadcast();
  })().finally(() => { warmPromise = null; });
  return warmPromise;
}
