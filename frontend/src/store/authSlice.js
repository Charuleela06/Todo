import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const signup = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/auth/signup', data); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/auth/login', data); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/auth/me'); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: builder => {
    builder
      .addCase(signup.pending, s => { s.loading = true; s.error = null; })
      .addCase(signup.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; localStorage.setItem('token', a.payload.token); s.user = a.payload.user; })
      .addCase(signup.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(login.pending, s => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; localStorage.setItem('token', a.payload.token); s.user = a.payload.user; })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload.user; })
      .addCase(fetchMe.rejected, (s) => { s.user = null; s.token = null; localStorage.removeItem('token'); });
  }
});

export const { logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
