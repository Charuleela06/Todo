import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';
import { setUserMeta } from './userSlice';

export const fetchTasks = createAsyncThunk('tasks/fetch', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await api.get(`/tasks?${params.toString()}`);
    return res.data.tasks;
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchById', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/tasks/${id}`); return res.data.task; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/tasks', data); return res.data.task; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue, dispatch }) => {
  try {
    const res = await api.put(`/tasks/${id}`, data);
    if (res.data?.user) dispatch(setUserMeta(res.data.user));
    return res.data; // may be { task, user } or just { task }
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

export const removeTask = createAsyncThunk('tasks/remove', async (id, { rejectWithValue }) => {
  try { await api.delete(`/tasks/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

// Assign a task to a user (must be project member or owner on backend)
export const assignTask = createAsyncThunk('tasks/assign', async ({ id, userId }, { rejectWithValue }) => {
  try { const res = await api.patch(`/tasks/${id}/assign`, { userId }); return res.data.task; }
  catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null, current: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, s => { s.loading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchTaskById.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(createTask.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateTask.fulfilled, (s, a) => {
        const updated = a.payload.task || a.payload; // support both shapes
        s.items = s.items.map(t => t._id === updated._id ? updated : t);
        s.current = updated;
      })
      .addCase(assignTask.fulfilled, (s, a) => {
        const updated = a.payload;
        s.items = s.items.map(t => t._id === updated._id ? updated : t);
        if (s.current?._id === updated._id) s.current = updated;
      })
      .addCase(removeTask.fulfilled, (s, a) => { s.items = s.items.filter(t => t._id !== a.payload); if (s.current?._id === a.payload) s.current = null; });
  }
});

export const selectTasks = (state) => state.tasks;
export default tasksSlice.reducer;
