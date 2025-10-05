import { Router } from 'express';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// List projects where requester is owner or member
router.get('/', async (req, res) => {
  const projects = await Project.find({
    $or: [
      { user: req.user._id },
      { 'members.user': req.user._id }
    ]
  }).sort({ createdAt: -1 });
  res.json({ projects });
});

// Get single project (owner or member)
router.get('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  const isOwner = String(project.user) === String(req.user._id);
  const isMember = project.members?.some(m => String(m.user) === String(req.user._id));
  if (!isOwner && !isMember) return res.status(403).json({ message: 'Forbidden' });
  res.json({ project });
});

// Create project (with optional ownerTitle)
router.post('/', async (req, res) => {
  try {
    const { name, color, ownerTitle } = req.body || {};
    const project = await Project.create({ name, color, ownerTitle, user: req.user._id });
    res.status(201).json({ project });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Update project (owner only)
router.put('/:id', async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json({ project });
});

// Share project (owner only). Body: { email, role: 'viewer'|'editor', title? }
router.post('/:id/share', async (req, res) => {
  const { email, role, title } = req.body || {};
  if (!email) return res.status(400).json({ message: 'Email required' });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  if (String(project.user) !== String(req.user._id)) return res.status(403).json({ message: 'Only owner can share' });
  const u = await User.findOne({ email: String(email).toLowerCase() });
  if (!u) return res.status(404).json({ message: 'User not found' });
  const r = role === 'editor' ? 'editor' : 'viewer';
  const exists = project.members?.some(m => String(m.user) === String(u._id));
  if (!exists) project.members.push({ user: u._id, role: r, title: String(title || '') });
  else project.members = project.members.map(m => String(m.user) === String(u._id) ? { ...(m.toObject?.() || m), role: r, title: String(title || m.title || '') } : m);
  await project.save();
  res.json({ members: project.members });
});

// List project members (owner + members)
router.get('/:id/members', async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members.user', 'name email')
    .populate('user', 'name email');
  if (!project) return res.status(404).json({ message: 'Not found' });
  const isOwner = String((project.user && project.user._id) || project.user) === String(req.user._id);
  const isMember = project.members?.some(m => String((m.user && m.user._id) || m.user) === String(req.user._id));
  if (!isOwner && !isMember) return res.status(403).json({ message: 'Forbidden' });
  res.json({ owner: project.user, ownerTitle: project.ownerTitle || '', members: project.members });
});

export default router;
