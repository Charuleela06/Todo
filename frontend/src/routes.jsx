import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Settings from './pages/Settings';
import AdminLayout from './pages/admin/AdminLayout';
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import RequireRole from './components/RequireRole';
import HomeRedirect from './utils/HomeRedirect';
import Landing from './pages/Landing';
import Sprint from './pages/Sprint';
import ProjectBoard from './pages/ProjectBoard';

export const router = createBrowserRouter([
  { path: '/', element: <App /> , children: [
    { index: true, element: <RequireRole role="user"><Dashboard /></RequireRole> },
    { path: 'dashboard', element: <RequireRole role="user"><Dashboard /></RequireRole> },
    { path: 'tasks', element: <RequireRole role="user"><Tasks /></RequireRole> },
    { path: 'task/:id', element: <RequireRole role="user"><TaskDetail /></RequireRole> },
    { path: 'settings', element: <RequireRole role="user"><Settings /></RequireRole> },
    { path: 'sprint', element: <RequireRole role="user"><Sprint /></RequireRole> },
    { path: 'projects/:id/board', element: <RequireRole role="user"><ProjectBoard /></RequireRole> },
    { path: 'admin', element: <RequireRole role="admin"><AdminLayout /></RequireRole>, children: [
      { path: 'users', element: <RequireRole role="admin"><Users /></RequireRole> },
      { path: 'analytics', element: <RequireRole role="admin"><Analytics /></RequireRole> },
    ]}
  ]},
  { path: '/welcome', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> }
]);
