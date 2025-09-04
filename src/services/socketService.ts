import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { 
  addNoteRealtime, 
  updateNoteRealtime, 
  deleteNoteRealtime, 
  archiveNoteRealtime,
  fetchNoteStats,
  fetchNotes,
  noteReminderReceived,
} from '@/store/slices/notesSlice';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io('http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
    });

    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data.message);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen to note events
    this.socket.on('note_created', (note) => {
      store.dispatch(addNoteRealtime(note));
    });

    this.socket.on('note_updated', (note) => {
      store.dispatch(updateNoteRealtime(note));
    });

    this.socket.on('note_deleted', (data) => {
      store.dispatch(deleteNoteRealtime(data));
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
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
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
}

export const socketService = new SocketService();
