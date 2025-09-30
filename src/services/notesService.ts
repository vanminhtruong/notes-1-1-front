import api from './api';

export interface Note {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  reminderAt: string | null;
  reminderSent: boolean;
  reminderAcknowledged: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateNoteData {
  title: string;
  content?: string;
  imageUrl?: string | null;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  reminderAt?: string | null;
  sharedFromUserId?: number; // For canCreate permission
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isArchived?: boolean;
  reminderAt?: string | null;
}

export interface NotesResponse {
  notes: Note[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NoteStats {
  stats: {
    total: number;
    active: number;
    archived: number;
    byPriority: Array<{ priority: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  };
}

export interface SharedNote {
  id: number;
  noteId: number;
  sharedWithUserId: number;
  sharedByUserId: number;
  canEdit: boolean;
  canDelete: boolean;
  canCreate?: boolean;
  message?: string;
  sharedAt: string;
  isActive: boolean;
  note: Note;
  sharedWithUser: {
    id: number;
    name: string;
    email: string;
  };
  sharedByUser: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ShareNoteData {
  userId: number;
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
  message?: string;
  messageId?: number;
}

export interface SharedNotesResponse {
  sharedNotes: SharedNote[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notesService = {
  async getNotes(params?: {
    page?: number;
    limit?: number;
    category?: string;
    priority?: string;
    search?: string;
    isArchived?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<NotesResponse> {
    const response = await api.get('/notes', { params });
    return response.data;
  },

  async getNoteById(id: number): Promise<{ note: Note }> {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  async createNote(data: CreateNoteData): Promise<{ message: string; note: Note }> {
    const response = await api.post('/notes', data);
    return response.data;
  },

  async updateNote(id: number, data: UpdateNoteData): Promise<{ message: string; note: Note }> {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  async archiveNote(id: number): Promise<{ message: string; note: Note }> {
    const response = await api.patch(`/notes/${id}/archive`);
    return response.data;
  },

  async getNoteStats(): Promise<NoteStats> {
    const response = await api.get('/notes/stats');
    return response.data;
  },

  async ackReminder(id: number): Promise<{ message: string; note: Note }> {
    const response = await api.patch(`/notes/${id}/ack-reminder`);
    return response.data;
  },

  // Share Notes APIs
  async shareNote(noteId: number, data: ShareNoteData): Promise<{ message: string; sharedNote: SharedNote }> {
    const response = await api.post(`/notes/${noteId}/share`, data);
    return response.data;
  },

  async getSharedWithMe(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<SharedNotesResponse> {
    const response = await api.get('/notes/shared/with-me', { params });
    return response.data;
  },

  async getSharedByMe(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<SharedNotesResponse> {
    const response = await api.get('/notes/shared/by-me', { params });
    return response.data;
  },

  async removeSharedNote(sharedNoteId: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/shared/${sharedNoteId}`);
    return response.data;
  },

  async getSharedNotePermissions(noteId: number): Promise<{ canEdit: boolean; canDelete: boolean; canCreate?: boolean; isOwner?: boolean; isShared?: boolean }> {
    const response = await api.get(`/notes/shared/permissions/${noteId}`);
    return response.data;
  },

  async getCreatePermissions(): Promise<{ permissions: Array<{ id: number; sharedByUserId: number; sharedByUser: { id: number; name: string; email: string }; canCreate: boolean }> }> {
    const response = await api.get('/notes/shared/create-permissions');
    return response.data;
  },

  async shareNoteToGroup(noteId: number, data: { groupId: number; message?: string; groupMessageId?: number }): Promise<{ message: string; groupSharedNote: any }> {
    const response = await api.post(`/notes/${noteId}/share-group`, data);
    return response.data;
  },
};
