/**
 * Client-only, opt-in encryption for personal text notes.
 * Passwords and derived keys are never sent to the API or persisted locally.
 * AES-256-GCM + PBKDF2-SHA-256 (310,000 iterations), fresh salt and nonce per write.
 * Not a substitute for an independent security audit.
 */
const ITERATIONS = 310_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

export type EncryptedMediaKind = 'image' | 'video' | 'background';
export interface EncryptedMediaInfo { id: string; salt: string; iv: string; type: string; name: string }
export interface PrivateNotePayload {
  title: string;
  content: string;
  media?: Partial<Record<EncryptedMediaKind, EncryptedMediaInfo>>;
  youtubeUrl?: string | null;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function fromBase64(text: string): Uint8Array {
  const raw = atob(text);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}
function mediaAAD(noteId: number, kind: EncryptedMediaKind): Uint8Array {
  return encoder.encode('plant-note:e2ee:media:v1:' + noteId + ':' + kind);
}
export async function encryptMediaBytes(noteId: number, kind: EncryptedMediaKind, file: Blob, password: string): Promise<{ ciphertext: Blob; salt: string; iv: string }> {
  if (!encryptionAvailable()) throw new Error('HTTPS hoặc localhost là bắt buộc.');
  if (file.size > 100 * 1024 * 1024) throw new Error('Tệp vượt quá 100 MB.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: mediaAAD(noteId, kind) as BufferSource }, key, await file.arrayBuffer());
  return { ciphertext: new Blob([ciphertext], { type: 'application/octet-stream' }), salt: toBase64(salt), iv: toBase64(iv) };
}
export async function decryptMediaBytes(noteId: number, kind: EncryptedMediaKind, bytes: ArrayBuffer, info: EncryptedMediaInfo, password: string): Promise<Blob> {
  try {
    const salt = fromBase64(info.salt);
    const iv = fromBase64(info.iv);
    if (salt.length !== 16 || iv.length !== 12) throw Error('Invalid media metadata');
    const key = await deriveKey(password, salt);
    const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: mediaAAD(noteId, kind) as BufferSource }, key, bytes);
    return new Blob([clear], { type: info.type || 'application/octet-stream' });
  } catch { throw new Error('Không thể giải mã tệp đính kèm.'); }
}
function additionalData(noteId: number): Uint8Array {
  return encoder.encode('plant-note:e2ee:v1:' + noteId);
}
export function encryptionAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle && !!crypto.getRandomValues && window.isSecureContext;
}
export async function encryptNotePayload(noteId: number, payload: PrivateNotePayload, password: string): Promise<string> {
  if (!encryptionAvailable()) throw new Error('Mã hóa yêu cầu HTTPS hoặc localhost và trình duyệt hỗ trợ Web Crypto.');
  if (password.length < 4) throw new Error('Encryption password must contain at least 4 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce as BufferSource, additionalData: additionalData(noteId) as BufferSource },
    key, encoder.encode(JSON.stringify(payload))
  );
  return ['E2EE1', toBase64(salt), toBase64(nonce), toBase64(new Uint8Array(ciphertext))].join('.');
}
export async function decryptNotePayload(noteId: number, envelope: string, password: string): Promise<PrivateNotePayload> {
  if (!encryptionAvailable()) throw new Error('Giải mã yêu cầu HTTPS hoặc localhost.');
  const parts = envelope.split('.');
  if (parts.length !== 4 || parts[0] !== 'E2EE1') throw new Error('Bản mã không được hỗ trợ.');
  try {
    const salt = fromBase64(parts[1]);
    const iv = fromBase64(parts[2]);
    const data = fromBase64(parts[3]);
    if (salt.length !== 16 || iv.length !== 12 || data.length < 16) throw Error('Invalid encrypted payload');
    const key = await deriveKey(password, salt);
    const result = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource, additionalData: additionalData(noteId) as BufferSource },
      key, data as BufferSource
    );
    const parsed: unknown = JSON.parse(decoder.decode(result));
    if (!parsed || typeof parsed !== 'object' ||
        typeof (parsed as PrivateNotePayload).title !== 'string' ||
        typeof (parsed as PrivateNotePayload).content !== 'string') throw Error('Invalid decrypted payload');
    return parsed as PrivateNotePayload;
  } catch {
    throw new Error('Sai mật khẩu hoặc dữ liệu đã mã hóa bị hỏng.');
  }
}
