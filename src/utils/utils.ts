import type { Message } from '../pages/Dashboard/components/interface/ChatTypes.interface';

// Helper to format timestamps for last message preview
export const formatPreviewTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  // If within this year, show day/month; otherwise include year
  const sameYear = d.getFullYear() === now.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (sameYear) {
    return `${m}/${day}`;
  }
  return formatDateMDYY(d);
};

// Generic date helpers
export const formatDateMDYY = (input?: string | Date | null) => {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const yy = String(d.getFullYear()).slice(-2);
  return `${m}/${day}/${yy}`;
};

export const formatDateTimeMDYY_HHmm = (input?: string | Date | null) => {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m}/${day}/${yy} ${hh}:${mm}`;
};

export const formatPreviewText = (
  msg: Message | null | undefined,
  currentUserId?: number,
  labels?: {
    recalled: string;
    image: string;
    file: string;
    youPrefix: string;
    noteShare?: string; // e.g. "Shared note"
    callLog?: {
      incomingVideo: string;
      incomingAudio: string;
      outgoingVideo: string;
      outgoingAudio: string;
      missedYou: string;
      youCancelled: string;
      cancelled: string;
    };
  }
) => {
  if (!msg) return '';
  if ((msg as any).isDeletedForAll) return labels?.recalled ?? 'Message recalled';
  const isOwn = !!currentUserId && msg.senderId === currentUserId;
  let body = '';
  switch (msg.messageType) {
    case 'image':
      body = labels?.image ?? 'Image 📷';
      break;
    case 'file':
      body = labels?.file ?? 'File 📎';
      break;
    default:
      body = msg.content || '';
      // Friendly preview for encoded call logs
      if (typeof body === 'string' && body.startsWith('CALL_LOG::')) {
        try {
          const raw = body.slice('CALL_LOG::'.length);
          const obj = JSON.parse(decodeURIComponent(raw));
          const media: 'audio'|'video' = obj.media === 'video' ? 'video' : 'audio';
          const direction: 'incoming'|'outgoing' = obj.direction === 'incoming' ? 'incoming' : 'outgoing';
          const result: 'answered'|'missed'|'cancelled' = (['answered','missed','cancelled'].includes(obj.result) ? obj.result : 'answered');
          // Perspective: if I'm not the sender, invert direction for my view
          const viewDir: 'incoming'|'outgoing' = isOwn ? direction : (direction === 'incoming' ? 'outgoing' : 'incoming');
          const L = labels?.callLog;
          if (result === 'missed') {
            return isOwn
              ? (media === 'video' ? (L?.incomingVideo ?? 'Incoming video call') : (L?.incomingAudio ?? 'Incoming audio call'))
              : (L?.missedYou ?? 'Missed call');
          }
          if (result === 'cancelled') {
            return isOwn ? (L?.youCancelled ?? 'You cancelled the call') : (L?.cancelled ?? 'Call was cancelled');
          }
          // answered or general
          return viewDir === 'incoming'
            ? (media === 'video' ? (L?.incomingVideo ?? 'Incoming video call') : (L?.incomingAudio ?? 'Incoming audio call'))
            : (media === 'video' ? (L?.outgoingVideo ?? 'Outgoing video call') : (L?.outgoingAudio ?? 'Outgoing audio call'));
        } catch {
          // fall through: show raw text if parsing fails
        }
      }
      // Friendly preview for NOTE_SHARE payloads
      if (typeof body === 'string' && body.startsWith('NOTE_SHARE::')) {
        try {
          const raw = body.slice('NOTE_SHARE::'.length);
          const obj = JSON.parse(decodeURIComponent(raw));
          const title: string = (obj && typeof obj.title === 'string' && obj.title.trim().length > 0) ? obj.title.trim() : 'Note';
          const prefix = labels?.noteShare ?? 'Shared note';
          body = `${prefix}: ${title}`;
        } catch {
          // if decoding fails, keep original body
        }
      }
  }
  if (isOwn) body = `${labels?.youPrefix ?? 'You:'} ${body}`;
  return body.replace(/\s+/g, ' ');
};

export const getCachedUser = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
