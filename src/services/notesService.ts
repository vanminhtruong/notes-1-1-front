import api from './api';

export interface NoteTag {
  id: number;
  name: string;
  color: string;
  isPinned?: boolean;
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  categoryId?: number | null;
  category?: NoteCategory | null;
  tags?: NoteTag[];
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  isPinned: boolean;
  reminderAt: string | null;
  reminderSent: boolean;
  reminderAcknowledged: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
  background?: string | null; // Alias for backgroundColor or backgroundImage
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface CreateNoteData {
  title: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  categoryId?: number | null;
  priority?: 'low' | 'medium' | 'high';
  reminderAt?: string | null;
  sharedFromUserId?: number; // For canCreate permission
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  categoryId?: number | null;
  priority?: 'low' | 'medium' | 'high';
  isArchived?: boolean;
  reminderAt?: string | null;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
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
    avatar?: string | null;
  };
  sharedByUser: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
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

export interface GroupSharedNote {
  id: number;
  noteId: number;
  groupId: number;
  sharedByUserId: number;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  message?: string;
  groupMessageId?: number;
  sharedAt: string;
  isActive: boolean;
  note: Note;
  group: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  sharedByUser: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface GroupSharedNotesResponse {
  groupSharedNotes: GroupSharedNote[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchSuggestion {
  id: number;
  title: string;
  snippet: string;
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  } | null;
  priority: 'low' | 'medium' | 'high';
  matchType: 'title' | 'content';
  createdAt: string;
}

export interface SearchAutocompleteResponse {
  suggestions: SearchSuggestion[];
  query: string;
  count: number;
}

export interface NoteFolder {
  id: number;
  name: string;
  color: string;
  icon: string;
  isPinned: boolean;
  userId: number;
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderData {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderData {
  name?: string;
  color?: string;
  icon?: string;
}

export interface FoldersResponse {
  folders: NoteFolder[];
  total: number;
}

export interface FolderWithNotesResponse {
  folder: NoteFolder;
  notes: Note[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchFoldersResponse {
  folders: NoteFolder[];
  notes: Note[];
  total: number;
  query: string;
}

export interface NoteCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isPinned: boolean;
  userId: number;
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  icon?: string;
}

export interface CategoriesResponse {
  categories: NoteCategory[];
  total: number;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

export interface TagsResponse {
  tags: NoteTag[];
  total: number;
}

export interface TagWithNotesResponse {
  tag: NoteTag;
  notes: Note[];
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

  async searchAutocomplete(query: string): Promise<SearchAutocompleteResponse> {
    const response = await api.get('/notes/search/autocomplete', { 
      params: { q: query } 
    });
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

  async getGroupSharedNotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<GroupSharedNotesResponse> {
    const response = await api.get('/notes/shared/groups', { params });
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

  async shareNoteToGroup(noteId: number, data: { groupId: number; canEdit?: boolean; canDelete?: boolean; canCreate?: boolean; message?: string; groupMessageId?: number }): Promise<{ message: string; groupSharedNote: any }> {
    const response = await api.post(`/notes/${noteId}/share-group`, data);
    return response.data;
  },

  async updateSharedNotePermissions(sharedNoteId: number, data: { canEdit?: boolean; canDelete?: boolean; canCreate?: boolean }): Promise<{ message: string; sharedNote: SharedNote }> {
    const response = await api.put(`/notes/shared/${sharedNoteId}/permissions`, data);
    return response.data;
  },

  async updateGroupSharedNotePermissions(groupSharedNoteId: number, data: { canEdit?: boolean; canDelete?: boolean; canCreate?: boolean }): Promise<{ message: string; groupSharedNote: GroupSharedNote }> {
    const response = await api.put(`/notes/shared/groups/${groupSharedNoteId}/permissions`, data);
    return response.data;
  },

  async removeGroupSharedNote(groupSharedNoteId: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/shared/groups/${groupSharedNoteId}`);
    return response.data;
  },

  // Folder APIs
  async getFolders(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<FoldersResponse> {
    const response = await api.get('/notes/folders', { params });
    return response.data;
  },

  async getFolderById(id: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<FolderWithNotesResponse> {
    const response = await api.get(`/notes/folders/${id}`, { params });
    return response.data;
  },

  async createFolder(data: CreateFolderData): Promise<{ message: string; folder: NoteFolder }> {
    const response = await api.post('/notes/folders', data);
    return response.data;
  },

  async updateFolder(id: number, data: UpdateFolderData): Promise<{ message: string; folder: NoteFolder }> {
    const response = await api.put(`/notes/folders/${id}`, data);
    return response.data;
  },

  async deleteFolder(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/folders/${id}`);
    return response.data;
  },

  async moveNoteToFolder(noteId: number, folderId: number | null): Promise<{ message: string; note: Note }> {
    const response = await api.patch(`/notes/${noteId}/move-to-folder`, { folderId });
    return response.data;
  },

  async searchFolders(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<SearchFoldersResponse> {
    const response = await api.get('/notes/folders/search/all', { params });
    return response.data;
  },

  async pinNote(id: number): Promise<{ message: string; note: Note }> {
    const response = await api.patch(`/notes/${id}/pin`);
    return response.data;
  },

  async unpinNote(id: number): Promise<{ message: string; note: Note }> {
    const response = await api.patch(`/notes/${id}/unpin`);
    return response.data;
  },

  async pinFolder(id: number): Promise<{ message: string; folder: NoteFolder }> {
    const response = await api.patch(`/notes/folders/${id}/pin`);
    return response.data;
  },

  async unpinFolder(id: number): Promise<{ message: string; folder: NoteFolder }> {
    const response = await api.patch(`/notes/folders/${id}/unpin`);
    return response.data;
  },

  // Category APIs
  async getCategories(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<CategoriesResponse> {
    const response = await api.get('/notes/categories', { params });
    return response.data;
  },

  async searchCategories(query: string, limit?: number): Promise<CategoriesResponse> {
    const response = await api.get('/notes/categories/search', { 
      params: { q: query, limit: limit || 20 } 
    });
    return response.data;
  },

  async getCategoryById(id: number): Promise<{ category: NoteCategory }> {
    const response = await api.get(`/notes/categories/${id}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryData): Promise<{ message: string; category: NoteCategory }> {
    const response = await api.post('/notes/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: UpdateCategoryData): Promise<{ message: string; category: NoteCategory }> {
    const response = await api.put(`/notes/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/categories/${id}`);
    return response.data;
  },

  async pinCategory(id: number): Promise<{ message: string; category: NoteCategory }> {
    const response = await api.patch(`/notes/categories/${id}/pin`);
    return response.data;
  },

  async unpinCategory(id: number): Promise<{ message: string; category: NoteCategory }> {
    const response = await api.patch(`/notes/categories/${id}/unpin`);
    return response.data;
  },

  // Tag APIs
  async getTags(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<TagsResponse> {
    const response = await api.get('/notes/tags', { params });
    return response.data;
  },

  async getTagById(id: number): Promise<{ tag: NoteTag }> {
    const response = await api.get(`/notes/tags/${id}`);
    return response.data;
  },

  async createTag(data: CreateTagData): Promise<{ message: string; tag: NoteTag }> {
    const response = await api.post('/notes/tags', data);
    return response.data;
  },

  async updateTag(id: number, data: UpdateTagData): Promise<{ message: string; tag: NoteTag }> {
    const response = await api.put(`/notes/tags/${id}`, data);
    return response.data;
  },

  async deleteTag(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/tags/${id}`);
    return response.data;
  },

  async togglePinTag(id: number): Promise<{ message: string; tag: NoteTag }> {
    const response = await api.patch(`/notes/tags/${id}/pin`);
    return response.data;
  },

  async addTagToNote(noteId: number, tagId: number): Promise<{ message: string; tag: NoteTag }> {
    const response = await api.post(`/notes/${noteId}/tags`, { tagId });
    return response.data;
  },

  async removeTagFromNote(noteId: number, tagId: number): Promise<{ message: string }> {
    const response = await api.delete(`/notes/${noteId}/tags/${tagId}`);
    return response.data;
  },

  async getNotesByTag(tagId: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<TagWithNotesResponse> {
    const response = await api.get(`/notes/tags/${tagId}/notes`, { params });
    return response.data;
  },
};
