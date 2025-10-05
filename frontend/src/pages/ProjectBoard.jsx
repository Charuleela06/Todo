import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import TaskQuickView from '../components/TaskQuickView';

// Simple Jira-like board grouped by status with HTML5 drag & drop
export default function ProjectBoard() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState('pending');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [quickTaskId, setQuickTaskId] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  const columns = useMemo(() => ([
    { key: 'pending', title: 'Backlog' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'completed', title: 'Done' }
  ]), []);

  const load = async () => {
    try {
      setLoading(true); setError('');
      const [tRes, pRes] = await Promise.all([
        api.get(`/tasks?project=${projectId}`),
        api.get(`/projects/${projectId}`)
      ]);
      setTasks(tRes.data.tasks || []);
      setProject(pRes.data.project || null);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const grouped = useMemo(() => {
    const g = { pending: [], in_progress: [], completed: [] };
    (tasks || []).forEach(t => { (g[t.status] || g.pending).push(t); });
    return g;
  }, [tasks]);

  const onDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task._id);
  };

  const onDrop = async (e, newStatus) => {
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    try {
      await api.put(`/tasks/${id}`, { status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null });
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const openCreate = (status) => {
    setCreateStatus(status);
    setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setCreateOpen(true);
  };

  const submitCreate = async (e) => {
    e?.preventDefault?.();
    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority || 'medium',
        status: createStatus,
        project: projectId,
      };
      if (form.dueDate) body.dueDate = form.dueDate;
      const res = await api.post('/tasks', body);
      setTasks(prev => [res.data.task, ...prev]);
      setCreateOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link to="/tasks" className="px-3 py-2 rounded border">Back to Tasks</Link>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded" style={{ background: project?.color || '#3b82f6' }} />
          {project?.name || 'Project Board'}
        </h2>
      </div>
      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
      {loading ? (<p>Loading...</p>) : (
        <div className="grid md:grid-cols-3 gap-4">
          {columns.map(col => (
            <div key={col.key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                 onDragOver={allowDrop}
                 onDrop={(e)=>onDrop(e, col.key)}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm uppercase tracking-wide">{col.title} <span className="text-xs text-gray-500">{grouped[col.key]?.length || 0}</span></div>
                <button className="text-xs px-2 py-1 rounded border" onClick={()=>openCreate(col.key)}>+ Create</button>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {(grouped[col.key] || []).map(t => (
                  <div key={t._id}
                       className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-3 shadow-sm cursor-grab"
                       draggable
                       onDragStart={(e)=>onDragStart(e, t)}
                       onClick={()=>{ setQuickTaskId(t._id); setQuickOpen(true); }}>
                    <div className="text-sm font-medium mb-1">{t.title}</div>
                    {t.description && <div className="text-xs text-gray-500 line-clamp-2 mb-1">{t.description}</div>}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="px-1.5 py-0.5 rounded-full border">{(t.priority || 'medium').toUpperCase()}</span>
                      {t.dueDate ? <span>• due {new Date(t.dueDate).toLocaleDateString()}</span> : null}
                    </div>
                  </div>
                ))}
                {(grouped[col.key] || []).length === 0 && (
                  <div className="text-xs text-gray-500">Drop tasks here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {createOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={()=>setCreateOpen(false)}>
          <div className="card p-6 w-full max-w-md bg-white dark:bg-gray-900" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold">New Task</h3>
              <button className="px-3 py-1 rounded border" onClick={()=>setCreateOpen(false)}>Close</button>
            </div>
            <form className="space-y-3" onSubmit={submitCreate}>
              <input className="input w-full" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
              <textarea className="input w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.priority} onChange={e=>setForm({...form, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input className="input" type="datetime-local" value={form.dueDate} onChange={e=>setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 py-2 rounded border" onClick={()=>setCreateOpen(false)}>Cancel</button>
                <button className="btn" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <TaskQuickView taskId={quickTaskId} projectId={projectId} open={quickOpen} onClose={()=>setQuickOpen(false)} />
    </div>
  );
}
