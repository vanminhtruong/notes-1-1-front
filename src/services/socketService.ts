import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { resetAuth } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import i18n from '@/libs/i18n';
import { 
  archiveNoteRealtime,
  fetchNoteStats,
  fetchNotes,
  noteReminderReceived,
} from '@/store/slices/notesSlice';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    // Prevent multiple connections
    if (this.socket && this.isConnected) {
      console.log('Socket already connected, skipping...');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io('http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
    });

    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}...`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    // Global account deletion => logout across tabs
    this.socket.on('account_deleted', (payload: any) => {
      try {
        const w: any = typeof window !== 'undefined' ? window : {};
        if (w.__ACCOUNT_DELETED_HANDLED__) return; // avoid duplicate handling across connections
        w.__ACCOUNT_DELETED_HANDLED__ = true;
      } catch {}

      try {
        const msg = i18n.t('user.accountDeleted', { ns: 'layout', defaultValue: payload?.message || 'Your account has been deleted. You will be logged out.' });
        toast.error(String(msg), { id: 'account-deleted' });
      } catch {}
      try { store.dispatch(resetAuth()); } catch {}
      try { this.disconnect(); } catch {}
    });

    // Account deactivation by admin => logout immediately
    this.socket.on('account_deactivated', (payload: any) => {
      try {
        const w: any = typeof window !== 'undefined' ? window : {};
        if (w.__ACCOUNT_DEACTIVATED_HANDLED__) return; // avoid duplicate handling across connections
        w.__ACCOUNT_DEACTIVATED_HANDLED__ = true;
      } catch {}

      try {
        const msg = i18n.t('user.accountDeactivated', { 
          ns: 'layout', 
          defaultValue: payload?.message || 'Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên. Bạn sẽ được đăng xuất.' 
        });
        toast.error(String(msg), { id: 'account-deactivated', duration: 5000 });
      } catch {}
      
      // Delay logout slightly to let user see the message
      setTimeout(() => {
        try { store.dispatch(resetAuth()); } catch {}
        try { this.disconnect(); } catch {}
      }, 2000);
    });

    // Listen to note events
    this.socket.on('note_created', async () => {
      // Fetch lại notes và stats để đảm bảo pagination và số liệu đúng
      store.dispatch(fetchNoteStats());
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    this.socket.on('note_updated', async () => {
      // Fetch lại notes và stats để cập nhật dữ liệu mới nhất
      store.dispatch(fetchNoteStats());
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    this.socket.on('note_deleted', async () => {
      // Fetch lại notes và stats sau khi xóa
      store.dispatch(fetchNoteStats());
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    this.socket.on('note_archived', async (data) => {
      store.dispatch(archiveNoteRealtime(data));
      // Refresh stats to ensure counts are in sync across tabs
      store.dispatch(fetchNoteStats());
      // Refetch notes for current filters/pagination to keep the list accurate
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    // Admin-side changes affecting user's notes
    this.socket.on('admin_note_created', async () => {
      // Fetch lại notes và stats khi admin tạo note
      store.dispatch(fetchNoteStats());
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    this.socket.on('admin_note_updated', async () => {
      // Fetch lại notes và stats khi admin cập nhật note
      store.dispatch(fetchNoteStats());
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    this.socket.on('admin_note_deleted', async () => {
      // Fetch lại notes và stats khi admin xóa note
      store.dispatch(fetchNoteStats());
      const state = store.getState();
      const { filters, pagination } = state.notes;
      store.dispatch(fetchNotes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
    });

    // Listen to typing indicators
    this.socket.on('typing_start', (data) => {
      console.log('User started typing:', data);
    });

    this.socket.on('typing_stop', (data) => {
      console.log('User stopped typing:', data);
    });

    this.socket.on('online_status', (data) => {
      console.log('Online status:', data);
    });

    // Reminder notifications
    this.socket.on('note_reminder', (payload: any) => {
      try {
        // Support different payload shapes
        if (payload?.id) {
          store.dispatch(noteReminderReceived({ noteId: payload.id, note: payload }));
        } else if (payload?.note?.id) {
          store.dispatch(noteReminderReceived({ noteId: payload.note.id, note: payload.note }));
        } else if (payload?.noteId) {
          store.dispatch(noteReminderReceived({ noteId: payload.noteId, note: payload.note }));
        }
      } catch (e) {
        console.warn('Failed to handle note_reminder payload', e);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      // Set flag immediately to prevent new connections
      this.isConnected = false;
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit events
  emitNoteCreated(note: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('note_created', note);
    }
  }

  emitNoteUpdated(note: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('note_updated', note);
    }
  }

  emitNoteDeleted(data: { id: number }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('note_deleted', data);
    }
  }

  emitNoteArchived(data: { id: number; isArchived: boolean }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('note_archived', data);
    }
  }

  emitTypingStart(noteId: number) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { noteId });
    }
  }

  emitTypingStop(noteId: number) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { noteId });
    }
  }

  getOnlineStatus() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_online_status');
    }
  }

  isSocketConnected() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
