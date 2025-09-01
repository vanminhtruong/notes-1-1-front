import api from './api';

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
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
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isArchived?: boolean;
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
};
