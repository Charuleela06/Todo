import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await api.get('/admin/analytics');
        setData(res.data);
      } catch (e) { setError(e.response?.data?.message || e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="card p-6">Loading...</div>;
  if (error) return <div className="card p-6 text-sm text-red-500">{error}</div>;

  const chartData = [
    { name: 'Completed', value: data.tasks.completed, color: '#22c55e' },
    { name: 'In Progress', value: data.tasks.in_progress, color: '#3b82f6' },
    { name: 'Pending', value: data.tasks.pending, color: '#f59e0b' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <p className="text-3xl font-bold">{data.usersCount}</p>
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Tasks Overview</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
