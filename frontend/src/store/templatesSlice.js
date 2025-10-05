import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const fetchTemplates = createAsyncThunk('templates/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/templates'); return res.data.templates; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const createTemplate = createAsyncThunk('templates/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/templates', data); return res.data.template; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const updateTemplate = createAsyncThunk('templates/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/templates/${id}`, data); return res.data.template; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const removeTemplate = createAsyncThunk('templates/remove', async (id, { rejectWithValue }) => {
  try { await api.delete(`/templates/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

const templatesSlice = createSlice({
  name: 'templates',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTemplates.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchTemplates.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchTemplates.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createTemplate.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateTemplate.fulfilled, (s, a) => { s.items = s.items.map(t => t._id === a.payload._id ? a.payload : t); })
      .addCase(removeTemplate.fulfilled, (s, a) => { s.items = s.items.filter(t => t._id !== a.payload); });
  }
});

export const selectTemplates = (state) => state.templates;
export default templatesSlice.reducer;
