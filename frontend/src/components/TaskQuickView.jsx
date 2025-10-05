import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import api from '../lib/api';

export default function TaskQuickView({ taskId, projectId, open, onClose }) {
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { info: currentUser } = useSelector(selectUser);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      try {
        setLoading(true); setError('');
        const [tRes, mRes] = await Promise.all([
          api.get(`/tasks/${taskId}`),
          projectId ? api.get(`/projects/${projectId}/members`) : Promise.resolve({ data: { owner: null, ownerTitle: '', members: [] } })
        ]);
        setTask(tRes.data.task);
        const list = [];
        if (mRes.data?.owner) {
          const o = mRes.data.owner;
          list.push({ id: o._id || o, name: o.name || 'Owner', email: o.email || '', role: 'owner', title: mRes.data.ownerTitle || '' });
        }
        (mRes.data?.members || []).forEach(m => {
          const u = m.user; list.push({ id: u._id, name: u.name, email: u.email, role: m.role, title: m.title || '' });
        });
        setMembers(list);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, taskId, projectId]);

  const roleOf = (userId) => members.find(m => m.id === userId)?.role || '';
  const titleOf = (userId) => members.find(m => m.id === userId)?.title || '';
  const profileOf = (userId) => members.find(m => m.id === userId) || null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-xl bg-white dark:bg-gray-900" onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">Task Details</h3>
          <button className="px-3 py-1 rounded border" onClick={onClose}>Close</button>
        </div>
        {loading && <p>Loading…</p>}
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        {task && (
          <div className="space-y-3">
            {task.project && task.project.name && (
              <div>
                <div className="text-sm text-gray-500">Project</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded" style={{ background: task.project?.color || '#3b82f6' }} />
                  <span className="font-medium">{task.project?.name}</span>
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Title</div>
              <div className="font-medium">{task.title}</div>
            </div>
            {task.description && (
              <div>
                <div className="text-sm text-gray-500">Description</div>
                <div>{task.description}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Priority</div>
                <div className="font-medium">{(task.priority || 'medium').toUpperCase()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div />
              <div>
                <div className="text-sm text-gray-500">Assigned By</div>
                <div className="font-medium">
                  {(() => {
                    // For normal tasks (no project selected), show account holder name
                    if (!projectId) {
                      return currentUser?.username || currentUser?.name || currentUser?.email || '—';
                    }
                    // For project tasks, prefer task.assignedBy
                    if (task.assignedBy) {
                      return task.assignedBy.username || task.assignedBy.name || task.assignedBy.email;
                    }
                    return '—';
                  })()}
                </div>
                {task.assignedAt && <div className="text-xs text-gray-500">on {new Date(task.assignedAt).toLocaleString()}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
