import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/web/session/authenticate', {
        params: {
          login: userData.email,
          password: userData.password,
          db: 'gr_suicide'
        }
      }, { withCredentials: true });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response.data.error || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
    loadUserFromStorage(state) {
      const storedUser = localStorage.user;
      if (storedUser) {
        // state.user = JSON.parse(storedUser);
        state.user = storedUser;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, loadUserFromStorage } = authSlice.actions;

export default authSlice.reducer;