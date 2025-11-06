import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { notesService, type NoteTag, type CreateTagData, type UpdateTagData } from '@/services/notesService';
import toast from 'react-hot-toast';

export interface NoteTagsState {
  tags: NoteTag[];
  currentTag: NoteTag | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NoteTagsState = {
  tags: [],
  currentTag: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTags = createAsyncThunk(
  'noteTags/fetchTags',
  async (params: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await notesService.getTags(params);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lấy danh sách tag thất bại';
      return rejectWithValue(message);
    }
  }
);

export const fetchTagById = createAsyncThunk(
  'noteTags/fetchTagById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notesService.getTagById(id);
      return response.tag;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lấy thông tin tag thất bại';
      return rejectWithValue(message);
    }
  }
);

export const createTag = createAsyncThunk(
  'noteTags/createTag',
  async (data: CreateTagData, { rejectWithValue }) => {
    try {
      const response = await notesService.createTag(data);
      toast.success('Tạo tag thành công');
      return response.tag;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Tạo tag thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTag = createAsyncThunk(
  'noteTags/updateTag',
  async ({ id, data }: { id: number; data: UpdateTagData }, { rejectWithValue }) => {
    try {
      const response = await notesService.updateTag(id, data);
      toast.success('Cập nhật tag thành công');
      return response.tag;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Cập nhật tag thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTag = createAsyncThunk(
  'noteTags/deleteTag',
  async (id: number, { rejectWithValue }) => {
    try {
      await notesService.deleteTag(id);
      toast.success('Xóa tag thành công');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xóa tag thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const togglePinTag = createAsyncThunk(
  'noteTags/togglePinTag',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notesService.togglePinTag(id);
      toast.success(response.message);
      return response.tag;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ghim/bỏ ghim tag thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addTagToNote = createAsyncThunk(
  'noteTags/addTagToNote',
  async ({ noteId, tagId }: { noteId: number; tagId: number }, { rejectWithValue }) => {
    try {
      const response = await notesService.addTagToNote(noteId, tagId);
      toast.success('Thêm tag vào ghi chú thành công');
      return { noteId, tag: response.tag };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Thêm tag vào ghi chú thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeTagFromNote = createAsyncThunk(
  'noteTags/removeTagFromNote',
  async ({ noteId, tagId }: { noteId: number; tagId: number }, { rejectWithValue }) => {
    try {
      await notesService.removeTagFromNote(noteId, tagId);
      toast.success('Xóa tag khỏi ghi chú thành công');
      return { noteId, tagId };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xóa tag khỏi ghi chú thất bại';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const noteTagsSlice = createSlice({
  name: 'noteTags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTag: (state) => {
      state.currentTag = null;
    },
    resetTags: () => {
      return initialState;
    },
    // Real-time updates from WebSocket
    addTagRealtime: (state, action: PayloadAction<NoteTag>) => {
      const exists = state.tags.some(tag => tag.id === action.payload.id);
      if (!exists) {
        // Thêm tag mới vào đầu danh sách rồi sắp xếp: tag ghim lên trước, sau đó theo thời gian tạo (mới trước)
        state.tags.unshift(action.payload);
        state.tags.sort((a: any, b: any) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      }
    },
    updateTagRealtime: (state, action: PayloadAction<NoteTag>) => {
      const index = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (index !== -1) {
        // Xóa tag cũ khỏi vị trí hiện tại
        state.tags.splice(index, 1);
      }
      // Thêm/cập nhật tag rồi sắp xếp lại: tag ghim lên trước, sau đó theo thời gian tạo (mới trước)
      state.tags.push(action.payload);
      state.tags.sort((a: any, b: any) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
      if (state.currentTag?.id === action.payload.id) {
        state.currentTag = action.payload;
      }
    },
    deleteTagRealtime: (state, action: PayloadAction<{ id: number }>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload.id);
      if (state.currentTag?.id === action.payload.id) {
        state.currentTag = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tags = action.payload.tags;
        state.error = null;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Tag by ID
      .addCase(fetchTagById.fulfilled, (state, action) => {
        state.currentTag = action.payload;
      })
      // Create Tag
      .addCase(createTag.fulfilled, (state) => {
        // Tag will be added by socket event 'tag_created' for real-time sync
        state.isLoading = false;
      })
      // Update Tag
      .addCase(updateTag.fulfilled, (state) => {
        // Tag will be updated by socket event 'tag_updated' for real-time sync
        state.isLoading = false;
      })
      // Delete Tag
      .addCase(deleteTag.fulfilled, (state) => {
        // Tag will be removed by socket event 'tag_deleted' for real-time sync
        state.isLoading = false;
      })
      // Toggle Pin Tag
      .addCase(togglePinTag.fulfilled, (state) => {
        // Tag will be updated by socket event 'tag_updated' for real-time sync
        state.isLoading = false;
      });
  },
});

export const {
  clearError,
  clearCurrentTag,
  resetTags,
  addTagRealtime,
  updateTagRealtime,
  deleteTagRealtime,
} = noteTagsSlice.actions;

export default noteTagsSlice.reducer;
