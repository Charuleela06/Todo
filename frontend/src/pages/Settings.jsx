import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ phone: '', notifications: { email: true, sms: false, push: false } });

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const me = await api.get('/users/me');
      setForm({ phone: me.data.user.phone || '', notifications: me.data.user.notifications || { email: true, sms: false, push: false } });
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      setError(null); setMessage('');
      await api.put('/users/me', form);
      setMessage('Settings saved');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const sendTestEmail = async () => {
    try {
      setError(null); setMessage('');
      await api.post('/notifications/test-email');
      setMessage('Test email sent (check your inbox/spam)');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const sendTestSMS = async () => {
    try {
      setError(null); setMessage('');
      await api.post('/notifications/test-sms');
      setMessage('Test SMS sent');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  if (loading) return <div className="card p-6">Loading...</div>;

  return (
    <div className="max-w-xl card p-6">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      {message && <p className="text-sm text-green-600 mb-2">{message}</p>}
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label">Phone number (for SMS)</label>
          <input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+1..." />
        </div>
        <div>
          <label className="label mb-2 block">Notifications</label>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notifications.email} onChange={e=>setForm({...form,notifications:{...form.notifications,email:e.target.checked}})} /> Email reminders</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notifications.sms} onChange={e=>setForm({...form,notifications:{...form.notifications,sms:e.target.checked}})} /> SMS reminders</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notifications.push} onChange={e=>setForm({...form,notifications:{...form.notifications,push:e.target.checked}})} /> Push notifications</label>
          </div>
        </div>
        <button className="btn">Save Settings</button>
      </form>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={sendTestEmail} className="px-4 py-2 rounded-lg border">Send test email</button>
        <button onClick={sendTestSMS} className="px-4 py-2 rounded-lg border">Send test SMS</button>
      </div>
      <p className="text-xs text-gray-500 mt-3">Scheduler runs every minute during debugging; for real reminders, create a task due within the next hour.</p>
    </div>
  );
}
