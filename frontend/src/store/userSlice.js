import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const fetchMe = createAsyncThunk('user/fetchMe', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/users/me'); return res.data.user; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

const initialState = { info: null, loading: false, error: null };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserMeta(state, action) {
      if (!state.info) state.info = {};
      const { points, badges } = action.payload || {};
      if (typeof points !== 'undefined') state.info.points = points;
      if (Array.isArray(badges)) state.info.badges = badges;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMe.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.loading = false; s.info = a.payload; })
      .addCase(fetchMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { setUserMeta } = userSlice.actions;
export const selectUser = (state) => state.user;
export default userSlice.reducer;
