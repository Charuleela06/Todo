import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';
import { sendSMS } from '../services/sms.js';
import { Task } from '../models/Task.js';

const router = Router();
router.use(auth);

router.post('/test-email', async (req, res) => {
  try {
    const to = req.user.email;
    await sendEmail({ to, subject: 'Todo App test email', html: `<p>Hello ${req.user.name}, this is a test email from Todo App.</p>` });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post('/test-sms', async (req, res) => {
  try {
    if (!req.user.phone) return res.status(400).json({ message: 'No phone configured' });
    await sendSMS({ to: req.user.phone, body: 'Todo App test SMS' });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Send a reminder for a specific task now (useful for debugging)
router.post('/send-now/:taskId', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id }).populate('user');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const user = task.user;
    const subject = `Reminder: ${task.title}`;
    const html = `<p>Hi ${user.name},</p><p>This is a manual reminder for <b>${task.title}</b>.</p>`;
    if (user.notifications?.email && user.email) await sendEmail({ to: user.email, subject, html });
    if (user.notifications?.sms && user.phone) await sendSMS({ to: user.phone, body: `Manual reminder: ${task.title}` });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

export default router;
