import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, type User, type LoginData, type RegisterData } from '@/services/authService';
import toast from 'react-hot-toast';
import i18n from '@/libs/i18n';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      localStorage.setItem('token', response.token);
      toast.success(i18n.t('auth:success.loginSuccess'));
      return response;
    } catch (error: any) {
      let message: string = error.response?.data?.message || i18n.t('auth:errors.loginFailed');
      // Normalize deactivated-account message to i18n key
      try {
        const low = String(message).toLowerCase();
        if (low.includes('vô hiệu hóa') || low.includes('deactivated')) {
          message = i18n.t('auth:errors.deactivated');
        }
      } catch {}
      // Ensure login error toast stays visible longer and avoid flicker by using a stable toast id
      toast.error(String(message), { duration: 10000, id: 'login-error' });
      return rejectWithValue(String(message));
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithGoogle(idToken);
      localStorage.setItem('token', response.token);
      toast.success(i18n.t('auth:success.loginSuccess'));
      return response;
    } catch (error: any) {
      let message: string = error.response?.data?.message || i18n.t('auth:errors.googleFailed');
      try {
        const low = String(message).toLowerCase();
        if (low.includes('vô hiệu hóa') || low.includes('deactivated')) {
          message = i18n.t('auth:errors.deactivated');
        }
      } catch {}
      toast.error(String(message), { id: 'login-error' });
      return rejectWithValue(String(message));
    }
  }
);


export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    data: { name?: string; avatar?: string; phone?: string | null; birthDate?: string | null; gender?: 'male' | 'female' | 'other' | 'unspecified' },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.updateProfile(data);
      toast.success(i18n.t('account:success.updated'));
      return response.user;
    } catch (error: any) {
      const message = error.response?.data?.message || i18n.t('account:errors.updateFailed');
      toast.error(i18n.t('account:errors.updateFailed'));
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      toast.success(i18n.t('auth:success.registerSuccess'));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || i18n.t('auth:errors.registerFailed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Relock E2EE on logout for security
      sessionStorage.removeItem('e2ee_unlocked');
      // Reset PIN prompt-once flag for next session
      sessionStorage.removeItem('e2ee_pin_prompt_shown');
      // Clear lock timestamp for next session to set anew on login
      sessionStorage.removeItem('e2ee_lock_started_at');
      toast.success(i18n.t('auth:success.logoutSuccess'));
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || i18n.t('auth:errors.logoutFailed');
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lấy thông tin người dùng thất bại';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Also clear E2EE unlocked state
      sessionStorage.removeItem('e2ee_unlocked');
      // Also clear PIN prompt-once flag
      sessionStorage.removeItem('e2ee_pin_prompt_shown');
      // Clear lock timestamp
      sessionStorage.removeItem('e2ee_lock_started_at');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        // Save user info to localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        // Ensure E2EE starts locked on fresh login
        sessionStorage.removeItem('e2ee_unlocked');
        // Allow a single auto-prompt this session
        sessionStorage.removeItem('e2ee_pin_prompt_shown');
        // Start a new lock window to hide prior locked-session messages
        sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        // Save user info to localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        // Ensure E2EE starts locked on fresh login
        sessionStorage.removeItem('e2ee_unlocked');
        // Allow a single auto-prompt this session
        sessionStorage.removeItem('e2ee_pin_prompt_shown');
        // Start a new lock window to hide prior locked-session messages
        sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        // Redundant safety: ensure E2EE unlocked flag is cleared
        sessionStorage.removeItem('e2ee_unlocked');
        // And clear PIN prompt-once flag
        sessionStorage.removeItem('e2ee_pin_prompt_shown');
        // Clear lock timestamp
        sessionStorage.removeItem('e2ee_lock_started_at');
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // Save user info to localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        // Save updated user info to localStorage
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
