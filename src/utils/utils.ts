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

// Summarize content for reply preview banner (reusable across components)
export const summarizeReplyContent = (
  messageType: string | undefined,
  content: string | undefined,
  t: (key: string, defaultValue?: any) => string
) => {
  if (messageType === 'image') return t('chat.reply.image', 'Hình ảnh');
  if (messageType === 'file') return t('chat.reply.file', 'Tệp đính kèm');
  const body = content || '';
  if (typeof body === 'string' && body.startsWith('NOTE_SHARE::')) {
    try {
      const raw = body.slice('NOTE_SHARE::'.length);
      const obj = JSON.parse(decodeURIComponent(raw));
      const title: string = (obj && typeof obj.title === 'string' && obj.title.trim().length > 0) ? obj.title.trim() : 'Note';
      return `${t('chat.preview.noteShare', 'Đã chia sẻ ghi chú')}: ${title}`;
    } catch {
      // fallthrough
    }
  }
  return body;
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

/**
 * Tính độ sáng (luminance) của màu hex theo chuẩn WCAG
 * @param hex - Mã màu hex (ví dụ: #f28b82)
 * @returns Giá trị luminance từ 0 (tối) đến 1 (sáng)
 */
export const getLuminance = (hex: string): number => {
  // Xử lý hex có hoặc không có #
  const cleanHex = hex.replace('#', '');
  
  // Chuyển hex sang RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  // Áp dụng công thức gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Tính luminance theo chuẩn WCAG
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
};

/**
 * Quyết định màu chữ (sáng/tối) phù hợp dựa trên màu nền
 * @param backgroundColor - Mã màu hex của nền (ví dụ: #f28b82)
 * @returns Object chứa các class màu cho text, border, icon phù hợp
 */
export const getTextColorForBackground = (backgroundColor: string | null): {
  text: string;
  textSecondary: string;
  border: string;
  icon: string;
} => {
  if (!backgroundColor) {
    // Không có nền màu, trả về màu mặc định (không thay đổi UI)
    return {
      text: 'text-gray-900 dark:text-white',
      textSecondary: 'text-gray-500 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-600',
      icon: 'text-gray-400',
    };
  }
  
  try {
    const luminance = getLuminance(backgroundColor);
    
    // Giảm ngưỡng xuống 0.35 để nhạy hơn, dùng màu đen/trắng thuần để tương phản tối đa
    // Nếu nền sáng (luminance > 0.35), dùng chữ đen thuần
    // Nếu nền tối (luminance <= 0.35), dùng chữ trắng thuần
    if (luminance > 0.35) {
      return {
        text: 'text-black',
        textSecondary: 'text-black',
        border: 'border-black',
        icon: 'text-black',
      };
    } else {
      return {
        text: 'text-white',
        textSecondary: 'text-white',
        border: 'border-white',
        icon: 'text-white',
      };
    }
  } catch {
    // Nếu có lỗi parse màu, trả về màu mặc định
    return {
      text: 'text-gray-900 dark:text-white',
      textSecondary: 'text-gray-500 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-600',
      icon: 'text-gray-400',
    };
  }
};

/**
 * Quyết định màu chữ cho nền có ảnh (giả định nền tối để dễ đọc)
 * @returns Object chứa các class màu cho text phù hợp với nền ảnh
 */
export const getTextColorForImageBackground = (): {
  text: string;
  textSecondary: string;
  border: string;
  icon: string;
} => {
  // Với nền ảnh, dùng chữ trắng thuần để đảm bảo dễ đọc trên mọi ảnh
  return {
    text: 'text-white',
    textSecondary: 'text-white',
    border: 'border-white',
    icon: 'text-white',
  };
};
