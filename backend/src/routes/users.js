import { Router } from 'express';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/me', async (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, email: u.email, phone: u.phone || '', notifications: u.notifications || { email: true, sms: false, push: false }, points: u.points || 0, badges: u.badges || [] } });
});

router.put('/me', async (req, res) => {
  try {
    const { phone, notifications } = req.body;
    if (typeof phone !== 'undefined') req.user.phone = phone;
    if (notifications && typeof notifications === 'object') {
      req.user.notifications = { ...req.user.notifications?.toObject?.() , ...notifications };
    }
    await req.user.save();
    const u = req.user;
    res.json({ user: { id: u._id, name: u.name, email: u.email, phone: u.phone || '', notifications: u.notifications, points: u.points || 0, badges: u.badges || [] } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
