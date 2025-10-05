import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  if (loading) return <div className="card p-6">Loading...</div>;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Users</h2>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b dark:border-gray-800">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b dark:border-gray-800">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.email}</td>
                <td className="py-2">
                  <select className="input py-1" value={u.role} onChange={e=>changeRole(u._id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="py-2 text-gray-500">{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-gray-500">No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
