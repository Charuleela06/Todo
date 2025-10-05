import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="space-y-4">
      <div className="card p-3 flex gap-3 text-sm">
        <NavLink to="/admin/users" className={({isActive})=>`px-3 py-1 rounded ${isActive?'bg-brand-600 text-white':'border'}`}>Users</NavLink>
        <NavLink to="/admin/analytics" className={({isActive})=>`px-3 py-1 rounded ${isActive?'bg-brand-600 text-white':'border'}`}>Analytics</NavLink>
      </div>
      <Outlet />
    </div>
  );
}
