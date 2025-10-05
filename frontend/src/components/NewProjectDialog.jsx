import { useState } from 'react';
import api from '../lib/api';

export default function NewProjectDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [ownerTitle, setOwnerTitle] = useState('frontend_developer');
  const [customTitle, setCustomTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const create = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      const finalTitle = ownerTitle === 'other' ? (customTitle || '') : ownerTitle.replace('_', ' ');
      const res = await api.post('/projects', { name, color, ownerTitle: finalTitle });
      setName('');
      setOwnerTitle('frontend_developer'); setCustomTitle('');
      if (onCreated) onCreated(res.data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="card p-6 w-full max-w-md bg-white dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-4">New Project</h3>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <form onSubmit={create} className="space-y-3">
          <input className="input w-full" placeholder="Project name" value={name} onChange={e=>setName(e.target.value)} required />
          <div className="flex items-center gap-2">
            <label className="text-sm w-20">Color</label>
            <input className="h-9 w-12 p-0 border rounded" type="color" value={color} onChange={e=>setColor(e.target.value)} />
            <input className="input flex-1" value={color} onChange={e=>setColor(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block mb-1">Your role/title in this project</label>
            <select className="input w-full" value={ownerTitle} onChange={e=>setOwnerTitle(e.target.value)}>
              <option value="frontend_developer">Frontend Developer</option>
              <option value="backend_developer">Backend Developer</option>
              <option value="fullstack_developer">Fullstack Developer</option>
              <option value="designer">Designer</option>
              <option value="project_manager">Project Manager</option>
              <option value="qa_engineer">QA Engineer</option>
              <option value="other">Other</option>
            </select>
            {ownerTitle === 'other' && (
              <input className="input w-full mt-2" placeholder="Enter your title" value={customTitle} onChange={e=>setCustomTitle(e.target.value)} />
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
            <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
