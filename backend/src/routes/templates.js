import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { Template } from '../models/Template.js';

const router = Router();
router.use(auth);

// List templates for current user
router.get('/', async (req, res) => {
  const templates = await Template.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json({ templates });
});

// Create template
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const tpl = await Template.create({ ...body, user: req.user._id });
    res.status(201).json({ template: tpl });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    const tpl = await Template.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!tpl) return res.status(404).json({ message: 'Not found' });
    res.json({ template: tpl });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const tpl = await Template.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tpl) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

export default router;
