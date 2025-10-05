import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectAuth } from '../store/authSlice';
import { Link, Navigate } from 'react-router-dom';

export default function Signup() {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector(selectAuth);
  const [form, setForm] = useState({ name:'', email: '', password: '', phone: '', role: 'user', adminCode: '' });

  if (token) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.role !== 'admin') delete payload.adminCode;
    dispatch(signup(payload));
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Create your account</h1>
      <form onSubmit={submit} className="space-y-4 card p-6">
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        </div>
        <div>
          <label className="label">Phone (for SMS)</label>
          <input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
        </div>
        <div>
          <label className="label mb-2 block">Account type</label>
          <div className="flex gap-4 text-sm text-gray-800 dark:text-gray-100">
            <label className="flex items-center gap-2"><input type="radio" name="role" checked={form.role==='user'} onChange={()=>setForm({...form, role:'user'})} /> <span>User</span></label>
            <label className="flex items-center gap-2"><input type="radio" name="role" checked={form.role==='admin'} onChange={()=>setForm({...form, role:'admin'})} /> <span>Admin</span></label>
          </div>
        </div>
        {form.role === 'admin' && (
          <div>
            <label className="label">Admin signup code</label>
            <input className="input" placeholder="Enter admin code" value={form.adminCode} onChange={e=>setForm({...form,adminCode:e.target.value})} required />
            <p className="text-xs text-gray-500 mt-1">Ask the system owner for the admin code.</p>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading? 'Creating...' : 'Sign up'}</button>
      </form>
      <p className="text-sm mt-4">Have an account? <Link to="/login" className="underline">Log in</Link></p>
    </div>
  );
}
