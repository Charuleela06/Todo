import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuth } from '../store/authSlice';
import { Link, Navigate } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector(selectAuth);
  const [form, setForm] = useState({ email: '', password: '' });

  if (token) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold mb-6">Welcome back</h1>
      <form onSubmit={submit} className="space-y-4 card p-6">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-sm mt-4">No account? <Link to="/signup" className="underline">Sign up</Link></p>
    </div>
  );
}
