import cron from 'node-cron';
import { Task } from '../models/Task.js';
import { sendEmail } from '../services/email.js';
import { sendSMS } from '../services/sms.js';

// Runs every 5 minutes to send reminders for due tasks in next hour
export function startSchedulers() {
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    console.log(`[scheduler] tick at ${now.toISOString()} scanning due between now and ${nextHour.toISOString()}`);
    const dueSoon = await Task.find({
      dueDate: { $gte: now, $lte: nextHour },
      status: { $ne: 'completed' }
    }).populate('user', 'name email notifications').populate('assignee', 'name email');
    console.log(`[scheduler] found ${dueSoon.length} task(s) due soon`);

    for (const task of dueSoon) {
      const { user } = task;
      const subject = `Reminder: ${task.title} is due soon`;
      const html = `<p>Hi ${user.name},</p><p>Your task <b>${task.title}</b> is due by ${new Date(task.dueDate).toLocaleString()}.</p>`;
      try {
        console.log(`[scheduler] Notifying user=${user.email} task=${task.title}`);
        if (user.notifications?.email && user.email) {
          await sendEmail({ to: user.email, subject, html });
          console.log('[scheduler] email sent (or mocked)');
        }
        if (task.assignee?.email) {
          const aHtml = `<p>Hi ${task.assignee.name || ''},</p><p>The task <b>${task.title}</b> assigned to you is due by ${new Date(task.dueDate).toLocaleString()}.</p>`;
          await sendEmail({ to: task.assignee.email, subject, html: aHtml });
          console.log('[scheduler] assignee email sent (or mocked)');
        }
        if (user.notifications?.sms && user.phone) {
          await sendSMS({ to: user.phone, body: `Task due soon: ${task.title}` });
          console.log('[scheduler] sms sent (or mocked)');
        }
      } catch (e) {
        console.error('Reminder error:', e.message);
      }
    }
  });
}
