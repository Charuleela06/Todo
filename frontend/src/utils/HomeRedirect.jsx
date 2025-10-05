import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth } from '../store/authSlice';

export default function HomeRedirect() {
  const { user, token } = useSelector(selectAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/welcome', { replace: true });
      return;
    }
    if (!user) return; // wait for fetchMe in App
    if (user.role === 'admin') navigate('/admin/users', { replace: true });
    else navigate('/tasks', { replace: true });
  }, [user, token]);

  return null;
}
