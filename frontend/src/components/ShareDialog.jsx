import { useState } from 'react';
import api from '../lib/api';

export default function ShareDialog({ projectId, open, onClose, onShared }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [memberTitle, setMemberTitle] = useState('frontend_developer');
  const [customTitle, setCustomTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const share = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      const finalTitle = memberTitle === 'other' ? (customTitle || '') : memberTitle.replace('_', ' ');
      await api.post(`/projects/${projectId}/share`, { email, role, title: finalTitle });
      setEmail(''); setRole('viewer');
      setMemberTitle('frontend_developer'); setCustomTitle('');
      if (onShared) onShared();
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
        <h3 className="text-lg font-semibold mb-4">Share Project</h3>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <form onSubmit={share} className="space-y-3">
          <input className="input w-full" type="email" placeholder="Teammate email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <select className="input w-full" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <div>
            <label className="text-sm block mb-1">Member role/title</label>
            <select className="input w-full" value={memberTitle} onChange={e=>setMemberTitle(e.target.value)}>
              <option value="frontend_developer">Frontend Developer</option>
              <option value="backend_developer">Backend Developer</option>
              <option value="fullstack_developer">Fullstack Developer</option>
              <option value="designer">Designer</option>
              <option value="project_manager">Project Manager</option>
              <option value="qa_engineer">QA Engineer</option>
              <option value="other">Other</option>
            </select>
            {memberTitle === 'other' && (
              <input className="input w-full mt-2" placeholder="Enter title" value={customTitle} onChange={e=>setCustomTitle(e.target.value)} />
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
            <button className="btn" disabled={loading}>{loading ? 'Sharing...' : 'Share'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
