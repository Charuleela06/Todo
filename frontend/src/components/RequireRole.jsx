import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/authSlice';

export default function RequireRole({ role, children }) {
  const { user, token } = useSelector(selectAuth);
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user) return null; // wait for fetchMe

  if (role === 'admin') {
    return user.role === 'admin' ? children : <Navigate to="/" replace />;
  }
  // role === 'user'
  return user.role === 'user' ? children : <Navigate to="/admin/users" replace />;
}
