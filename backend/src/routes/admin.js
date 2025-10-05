import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

const router = Router();

router.use(auth, admin);

// List users (basic info)
router.get('/users', async (req, res) => {
  const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
  res.json({ users });
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// Basic analytics
router.get('/analytics', async (_req, res) => {
  const [usersCount, tasksTotal, tasksCompleted, tasksPending, tasksInProgress] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({ status: 'completed' }),
    Task.countDocuments({ status: 'pending' }),
    Task.countDocuments({ status: 'in_progress' })
  ]);
  res.json({
    usersCount,
    tasks: { total: tasksTotal, completed: tasksCompleted, pending: tasksPending, in_progress: tasksInProgress }
  });
});

export default router;
