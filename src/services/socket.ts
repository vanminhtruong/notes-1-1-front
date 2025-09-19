import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { store } from '@/store';
import { resetAuth } from '@/store/slices/authSlice';
import i18n from '@/libs/i18n';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  // Reuse existing connected socket
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem('token');
  if (!token) return null;

  // Prefer explicit env, otherwise use current hostname so cross-device works
  const envUrl = (import.meta as any).env?.VITE_BACKEND_WS_URL as string | undefined;
  const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : 'localhost';
  const url = envUrl || `http://${host}:3000`;

  socket = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'], // allow fallback if WS blocked
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Optional basic logs
  console.log('[socket] connecting to:', url);
  socket.on('connect', () => console.log('[socket] connected:', socket?.id));
  socket.on('connect_error', (err) => console.error('[socket] connect_error:', err.message));
  socket.on('disconnect', (reason) => console.log('[socket] disconnected:', reason));

  // Global listener: when backend deactivates this account, force logout everywhere
  socket.on('account_deleted', (payload: any) => {
    try {
      const w: any = typeof window !== 'undefined' ? window : {};
      if (w.__ACCOUNT_DELETED_HANDLED__) return; // avoid duplicate handling across multiple sockets
      w.__ACCOUNT_DELETED_HANDLED__ = true;
    } catch {}

    try {
      const msg = i18n.t('user.accountDeleted', { ns: 'layout', defaultValue: payload?.message || 'Your account has been deleted. You will be logged out.' });
      toast.error(String(msg), { id: 'account-deleted' });
    } catch {}
    try { store.dispatch(resetAuth()); } catch {}
    try { setTimeout(() => disconnectSocket(), 50); } catch {}
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
