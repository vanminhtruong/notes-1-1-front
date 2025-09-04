import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { notesService, type Note, type CreateNoteData, type UpdateNoteData } from '@/services/notesService';
import toast from 'react-hot-toast';
import i18n from '@/libs/i18n';

export interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    search: string;
    category: string;
    priority: string;
    isArchived: boolean;
  };
  stats: {
    total: number;
    active: number;
    archived: number;
    byPriority: Array<{ priority: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
  // Track which notes have an active due reminder (to show ringing bell UI)
  dueReminderNoteIds: number[];
}

const initialState: NotesState = {
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    search: '',
    category: '',
    priority: '',
    isArchived: false,
  },
  stats: {
    total: 0,
    active: 0,
    archived: 0,
    byPriority: [],
    byCategory: [],
  },
  dueReminderNoteIds: [],
};

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    priority?: string;
    search?: string;
    isArchived?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await notesService.getNotes(params);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lấy danh sách ghi chú thất bại';
      return rejectWithValue(message);
    }
  }
);

export const ackReminder = createAsyncThunk(
  'notes/ackReminder',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notesService.ackReminder(id);
      // Use translated toast message instead of backend-provided text
      toast.success(i18n.t('dashboard:success.reminderAcknowledged'));
      return response.note;
    } catch (error: any) {
      const fallback = i18n.t('dashboard:errors.reminderAcknowledgeFailed');
      const message = error.response?.data?.message || fallback;
      toast.error(fallback);
      return rejectWithValue(message);
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notesService.getNoteById(id);
      return response.note;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lấy thông tin ghi chú thất bại';
      return rejectWithValue(message);
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (data: CreateNoteData, { rejectWithValue }) => {
    try {
      const response = await notesService.createNote(data);
      toast.success(response.message);
      return response.note;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Tạo ghi chú thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, data }: { id: number; data: UpdateNoteData }, { rejectWithValue }) => {
    try {
      const response = await notesService.updateNote(id, data);
      toast.success(response.message);
      return response.note;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Cập nhật ghi chú thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notesService.deleteNote(id);
      toast.success(response.message);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xóa ghi chú thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const archiveNote = createAsyncThunk(
  'notes/archiveNote',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notesService.archiveNote(id);
      toast.success(response.message);
      return response.note;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Thao tác thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchNoteStats = createAsyncThunk(
  'notes/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notesService.getNoteStats();
      return response.stats;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lấy thống kê thất bại';
      return rejectWithValue(message);
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<NotesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
    resetNotes: () => {
      return initialState;
    },
    // Real-time updates from WebSocket
    addNoteRealtime: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload);
      state.stats.total += 1;
      state.stats.active += 1;
    },
    updateNoteRealtime: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(note => note.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
      if (state.currentNote?.id === action.payload.id) {
        state.currentNote = action.payload;
      }
    },
    deleteNoteRealtime: (state, action: PayloadAction<{ id: number }>) => {
      state.notes = state.notes.filter(note => note.id !== action.payload.id);
      if (state.currentNote?.id === action.payload.id) {
        state.currentNote = null;
      }
      state.stats.total -= 1;
      state.stats.active -= 1;
    },
    archiveNoteRealtime: (state, action: PayloadAction<{ id: number; isArchived: boolean }>) => {
      const { id, isArchived } = action.payload;
      const index = state.notes.findIndex(n => n.id === id);
      if (index !== -1) {
        // Update archived flag
        state.notes[index].isArchived = isArchived;
        // If the note no longer matches current filter, remove it from the list
        if (state.filters.isArchived !== isArchived) {
          state.notes.splice(index, 1);
        }
      }
      if (state.currentNote?.id === id) {
        state.currentNote.isArchived = isArchived;
      }
      // Update stats optimistically
      if (isArchived) {
        state.stats.active = Math.max(0, state.stats.active - 1);
        state.stats.archived += 1;
      } else {
        state.stats.active += 1;
        state.stats.archived = Math.max(0, state.stats.archived - 1);
      }
    },
    // Reminder due event from server
    noteReminderReceived: (state, action: PayloadAction<{ noteId: number; note?: Note }>) => {
      const { noteId, note } = action.payload;
      if (!state.dueReminderNoteIds.includes(noteId)) {
        state.dueReminderNoteIds.push(noteId);
      }
      if (note) {
        const idx = state.notes.findIndex(n => n.id === note.id);
        if (idx !== -1) state.notes[idx] = note;
        if (state.currentNote?.id === note.id) state.currentNote = note;
      }
    },
    // UI can acknowledge a reminder to stop ringing bell
    acknowledgeReminder: (state, action: PayloadAction<number>) => {
      state.dueReminderNoteIds = state.dueReminderNoteIds.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload.notes;
        state.pagination = action.payload.pagination;
        state.error = null;
        // Recompute due reminders on each fetch to persist bell state across refresh
        const now = Date.now();
        state.dueReminderNoteIds = action.payload.notes
          .filter(n => !!n.reminderAt && new Date(n.reminderAt as string).getTime() <= now && !n.reminderAcknowledged)
          .map(n => n.id);
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Note by ID
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.currentNote = action.payload;
      })
      // Create Note
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
        state.stats.total += 1;
        state.stats.active += 1;
      })
      // Update Note
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?.id === action.payload.id) {
          state.currentNote = action.payload;
        }
      })
      // Delete Note
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => note.id !== action.payload);
        if (state.currentNote?.id === action.payload) {
          state.currentNote = null;
        }
        state.stats.total -= 1;
        state.stats.active -= 1;
      })
      // Archive Note
      .addCase(archiveNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        if (state.currentNote?.id === action.payload.id) {
          state.currentNote = action.payload;
        }
      })
      // Acknowledge reminder
      .addCase(ackReminder.fulfilled, (state, action) => {
        const idx = state.notes.findIndex(n => n.id === action.payload.id);
        if (idx !== -1) state.notes[idx] = action.payload;
        if (state.currentNote?.id === action.payload.id) state.currentNote = action.payload;
        state.dueReminderNoteIds = state.dueReminderNoteIds.filter(id => id !== action.payload.id);
      })
      // Fetch Stats
      .addCase(fetchNoteStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearCurrentNote,
  resetNotes,
  addNoteRealtime,
  updateNoteRealtime,
  deleteNoteRealtime,
  archiveNoteRealtime,
  noteReminderReceived,
  acknowledgeReminder,
} = notesSlice.actions;

export default notesSlice.reducer;
