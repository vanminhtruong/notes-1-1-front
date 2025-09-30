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

  // Global listener: when admin logs out this session
  socket.on('session_terminated', (payload: any) => {
    console.log('[socket] session_terminated received:', payload);
    
    // Use timestamp-based dedupe instead of global flag
    const eventKey = `session_terminated_${payload?.timestamp || Date.now()}`;
    try {
      const w: any = typeof window !== 'undefined' ? window : {};
      w.__SOCKET_EVENTS__ = w.__SOCKET_EVENTS__ || {};
      if (w.__SOCKET_EVENTS__[eventKey]) {
        console.log('[socket] session_terminated already handled');
        return;
      }
      w.__SOCKET_EVENTS__[eventKey] = true;
      // Cleanup old events (keep only last 10)
      const keys = Object.keys(w.__SOCKET_EVENTS__);
      if (keys.length > 10) {
        keys.slice(0, keys.length - 10).forEach(k => delete w.__SOCKET_EVENTS__[k]);
      }
    } catch {}

    try {
      const msg = i18n.t('user.sessionTerminated', { 
        ns: 'layout', 
        defaultValue: payload?.message || 'Your session has been terminated by administrator. You will be logged out.' 
      });
      toast.error(String(msg), { id: 'session-terminated', duration: 5000 });
    } catch {}
    
    console.log('[socket] Logging out due to session_terminated');
    try { store.dispatch(resetAuth()); } catch {}
    try { setTimeout(() => disconnectSocket(), 500); } catch {}
  });

  // Global listener: when admin logs out all sessions
  socket.on('all_sessions_terminated', (payload: any) => {
    console.log('[socket] all_sessions_terminated received:', payload);
    
    // Use timestamp-based dedupe instead of global flag
    const eventKey = `all_sessions_terminated_${payload?.timestamp || Date.now()}`;
    try {
      const w: any = typeof window !== 'undefined' ? window : {};
      w.__SOCKET_EVENTS__ = w.__SOCKET_EVENTS__ || {};
      if (w.__SOCKET_EVENTS__[eventKey]) {
        console.log('[socket] all_sessions_terminated already handled');
        return;
      }
      w.__SOCKET_EVENTS__[eventKey] = true;
      // Cleanup old events (keep only last 10)
      const keys = Object.keys(w.__SOCKET_EVENTS__);
      if (keys.length > 10) {
        keys.slice(0, keys.length - 10).forEach(k => delete w.__SOCKET_EVENTS__[k]);
      }
    } catch {}

    try {
      const msg = i18n.t('user.allSessionsTerminated', { 
        ns: 'layout', 
        defaultValue: payload?.message || 'All your sessions have been terminated by administrator. You will be logged out.' 
      });
      toast.error(String(msg), { id: 'all-sessions-terminated', duration: 5000 });
    } catch {}
    
    console.log('[socket] Logging out due to all_sessions_terminated');
    try { store.dispatch(resetAuth()); } catch {}
    try { setTimeout(() => disconnectSocket(), 500); } catch {}
  });

  // Global listener: when user logs out all other sessions from devices modal
  socket.on('all_sessions_revoked', (payload: any) => {
    console.log('[socket] all_sessions_revoked received:', payload);
    
    // Check if this device should logout (not the one that initiated the logout)
    const currentToken = localStorage.getItem('token');
    if (payload?.exceptToken && payload.exceptToken === currentToken) {
      console.log('[socket] This is the device that initiated logout, skip');
      return;
    }

    // Use timestamp-based dedupe
    const eventKey = `all_sessions_revoked_${Date.now()}`;
    try {
      const w: any = typeof window !== 'undefined' ? window : {};
      w.__SOCKET_EVENTS__ = w.__SOCKET_EVENTS__ || {};
      if (w.__SOCKET_EVENTS__[eventKey]) {
        console.log('[socket] all_sessions_revoked already handled');
        return;
      }
      w.__SOCKET_EVENTS__[eventKey] = true;
      const keys = Object.keys(w.__SOCKET_EVENTS__);
      if (keys.length > 10) {
        keys.slice(0, keys.length - 10).forEach(k => delete w.__SOCKET_EVENTS__[k]);
      }
    } catch {}

    try {
      const msg = payload?.message || 'Your session has been logged out from another device.';
      toast.error(String(msg), { id: 'session-revoked', duration: 5000 });
    } catch {}
    
    console.log('[socket] Logging out due to all_sessions_revoked');
    try { store.dispatch(resetAuth()); } catch {}
    try { setTimeout(() => disconnectSocket(), 500); } catch {}
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
