import type { Message } from './types';

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
  return d.toLocaleDateString([], sameYear ? { day: '2-digit', month: '2-digit' } : { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatPreviewText = (
  msg: Message | null | undefined,
  currentUserId?: number,
  labels?: { recalled: string; image: string; file: string; youPrefix: string }
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
