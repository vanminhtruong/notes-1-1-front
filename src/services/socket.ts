import { io, Socket } from 'socket.io-client';

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

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
