import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTaskById, updateTask, removeTask, selectTasks, assignTask } from '../store/tasksSlice';
import api from '../lib/api';

export default function TaskDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector(selectTasks);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' });
  const [members, setMembers] = useState([]);
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    dispatch(fetchTaskById(id));
  }, [id]);

  useEffect(() => {
    if (current && current._id === id) {
      setForm({
        title: current.title || '',
        description: current.description || '',
        priority: current.priority || 'medium',
        status: current.status || 'pending',
        dueDate: current.dueDate ? new Date(current.dueDate).toISOString().slice(0,16) : ''
      });
      setAssignee(current.assignee || '');
      // Fetch project members when task has a project
      if (current.project) {
        api.get(`/projects/${current.project}/members`).then(res => {
          const owner = res.data.owner;
          const list = [];
          if (owner) list.push({ id: owner._id || owner, name: owner.name || 'Owner', email: owner.email || '' });
          (res.data.members || []).forEach(m => {
            const u = m.user;
            list.push({ id: u._id, name: u.name, email: u.email, role: m.role });
          });
          setMembers(list);
        }).catch(() => setMembers([]));
      } else {
        setMembers([]);
      }
    }
  }, [current, id]);

  const save = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.dueDate) payload.dueDate = null;
    dispatch(updateTask({ id, data: payload }));
  };

  const del = async () => {
    await dispatch(removeTask(id));
    navigate('/tasks');
  };

  const doAssign = async () => {
    if (!assignee) return;
    await dispatch(assignTask({ id, userId: assignee }));
  };

  if (!current) return <div className="card p-6">Loading...</div>;

  return (
    <div className="card p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Edit Task</h1>
      <form onSubmit={save} className="space-y-3">
        <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        <textarea className="input" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <input className="input" type="datetime-local" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
        {current?.project && (
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="text-sm block mb-1">Assignee</label>
              <select className="input w-full" value={assignee} onChange={e=>setAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} {m.email ? `(${m.email})` : ''}</option>
                ))}
              </select>
            </div>
            <button type="button" className="btn" onClick={doAssign}>Assign</button>
          </div>
        )}
        <div className="flex gap-3">
          <button className="btn">Save</button>
          <button type="button" onClick={del} className="px-4 py-2 rounded-lg border">Delete</button>
        </div>
      </form>
    </div>
  );
}
