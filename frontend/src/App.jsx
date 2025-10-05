import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, logout, fetchMe as fetchAuthMe } from './store/authSlice';
import { fetchMe as fetchUserMe } from './store/userSlice';
import { selectUser } from './store/userSlice';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const { user, token } = useSelector(selectAuth);
  const { info: userInfo } = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token && !user) dispatch(fetchAuthMe());
    if (token && !userInfo) dispatch(fetchUserMe());
  }, [token]);

  useEffect(() => {
    // Allow public pages when logged out
    const publicPaths = ['/', '/welcome', '/login', '/signup'];
    if (!token && !publicPaths.includes(location.pathname)) {
      navigate('/welcome');
    }
  }, [token, location.pathname]);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <Link to="/welcome" className="font-bold text-xl hover:opacity-80 transition-opacity">✅ Todo</Link>
          <nav className="flex gap-3 text-sm">
            {!token && (
              <>
                <Link to="/welcome" className="hover:underline">Home</Link>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/signup" className="hover:underline">Signup</Link>
              </>
            )}
            {token && user?.role !== 'admin' && (
              <>
                <Link to="/" className="hover:underline">Dashboard</Link>
                <Link to="/tasks" className="hover:underline">Tasks</Link>
                <Link to="/sprint" className="hover:underline">Sprint</Link>
                <Link to="/settings" className="hover:underline">Settings</Link>
              </>
            )}
            {token && user?.role === 'admin' && (
              <>
                <Link to="/admin/users" className="hover:underline">Admin</Link>
                <Link to="/admin/analytics" className="hover:underline">Analytics</Link>
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {token && (
              <button className="btn" onClick={() => dispatch(logout())}>Logout</button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl p-4 text-center text-xs text-gray-500">
        Built with ❤️ MERN
      </footer>
    </div>
  );
}
