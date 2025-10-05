import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    // Default role is 'user'. Allow admin self-signup only if ADMIN_SIGNUP_CODE matches.
    let role = 'user';
    if (req.body.role === 'admin') {
      const code = String(req.body.adminCode || '');
      if (config.adminSignupCode && code === config.adminSignupCode) {
        role = 'admin';
      }
    }
    const user = await User.create({ name, email, password, phone, role });
    // Auto-promote to admin if email matches ADMIN_EMAIL
    if (config.adminEmail && user.email.toLowerCase() === config.adminEmail.toLowerCase()) {
      user.role = 'admin';
      await user.save();
    }
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    // Ensure role is in sync with ADMIN_EMAIL in case it was added later
    if (config.adminEmail && user.email.toLowerCase() === config.adminEmail.toLowerCase() && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token' });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
