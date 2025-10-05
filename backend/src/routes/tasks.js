import { Router } from 'express';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { auth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { sendEmail } from '../services/email.js';
const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { status, priority, q, category, subcategory, project } = req.query;
    // Projects accessible by the user (owner or member)
    const accessibleProjects = await Project.find({
      $or: [ { user: req.user._id }, { 'members.user': req.user._id } ]
    }).select('_id');
    const accessibleProjectIds = accessibleProjects.map(p => p._id);

    const ownerOrProject = [{ user: req.user._id }];
    if (accessibleProjectIds.length) ownerOrProject.push({ project: { $in: accessibleProjectIds } });

    const filter = { $and: [ { $or: ownerOrProject } ] };
    if (project) {
      filter.$and.push({ project });
    } else {
      // Hide project tasks from normal todos when no project filter
      filter.$and.push({ $or: [ { project: { $exists: false } }, { project: null } ] });
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { assignEmail, memberRole, memberTitle } = req.body || {};
    const base = { ...req.body, user: req.user._id };
    delete base.assignEmail; delete base.memberRole; delete base.memberTitle;

    // If project provided and assignment info present, ensure membership and set assignee
    let assigneeUser = null;
    let projectDoc = null;
    if (base.project && assignEmail) {
      projectDoc = await Project.findById(base.project);
      if (!projectDoc) return res.status(400).json({ message: 'Project not found' });
      // Only owner or editor can create tasks in a project
      const isOwner = String(projectDoc.user) === String(req.user._id);
      const isEditor = projectDoc.members?.some(m => String(m.user) === String(req.user._id) && m.role === 'editor');
      if (!isOwner && !isEditor) return res.status(403).json({ message: 'Forbidden' });

      assigneeUser = await User.findOne({ email: String(assignEmail).toLowerCase() });
      if (assigneeUser) {
        const exists = projectDoc.members?.some(m => String(m.user) === String(assigneeUser._id));
        const r = memberRole === 'editor' ? 'editor' : 'viewer';
        const t = String(memberTitle || '');
        if (!exists) projectDoc.members.push({ user: assigneeUser._id, role: r, title: t });
        else projectDoc.members = projectDoc.members.map(m => String(m.user) === String(assigneeUser._id) ? { ...(m.toObject?.() || m), role: r, title: t || m.title || '' } : m);
        await projectDoc.save();
        base.assignee = assigneeUser._id;
        base.assignedBy = req.user._id;
        base.assignedAt = new Date();
      }
    }

    const task = await Task.create(base);

    // Send notification email for project assignment
    if (assignEmail && base.project) {
      const subject = assigneeUser ? `New task assigned to you: ${task.title}` : `You were mentioned on a project: ${projectDoc?.name || ''}`;
      const lines = [
        assigneeUser ? `Hi ${assigneeUser.name || ''},` : 'Hello,',
        '',
        assigneeUser ? `You have been assigned a task in project "${projectDoc?.name || 'Project'}".` : `A task was created in project "${projectDoc?.name || 'Project'}" mentioning your email.` ,
        `Title: ${task.title}`,
        task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleString()}` : '',
        base.assignedAt ? `Assigned At: ${new Date(base.assignedAt).toLocaleString()}` : '',
        '',
        'Please log in to view the details.'
      ].filter(Boolean);
      await sendEmail({ to: assignEmail, subject, html: lines.join('<br/>') });
    }

    // Send notification email for normal task creation (no project/assignee flow)
    if (!base.project && req.user?.email) {
      const subject = `Task created: ${task.title}`;
      const lines = [
        `Hi ${req.user.name || ''},`,
        '',
        `Your task has been created.`,
        `Title: ${task.title}`,
        task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleString()}` : '',
        '',
        'You can manage this task in your Tasks list.'
      ].filter(Boolean);
      await sendEmail({ to: req.user.email, subject, html: lines.join('<br/>') });
    }

    res.status(201).json({ task });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'name color user members')
    .populate('assignee', 'name email')
    .populate('assignedBy', 'name email');
  if (!task) return res.status(404).json({ message: 'Not found' });

  // Permission: owner OR any project member if task belongs to a project
  let canView = String(task.user) === String(req.user._id);
  if (!canView && task.project) {
    const project = await Project.findById(task.project);
    if (project) {
      const isOwner = String(project.user) === String(req.user._id);
      const isMember = project.members?.some(m => String(m.user) === String(req.user._id));
      canView = isOwner || isMember;
    }
  }
  if (!canView) return res.status(403).json({ message: 'Forbidden' });

  res.json({ task });
});

router.put('/:id', async (req, res) => {
  try {
    // Load existing to check permissions and detect status transition
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });

    // Permission: owner OR project editor/owner if task belongs to a project the user can edit
    let canEdit = String(existing.user) === String(req.user._id);
    if (!canEdit && existing.project) {
      const project = await Project.findById(existing.project);
      if (project) {
        const isOwner = String(project.user) === String(req.user._id);
        const isEditor = project.members?.some(m => String(m.user) === String(req.user._id) && m.role === 'editor');
        canEdit = isOwner || isEditor;
      }
    }
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    const wasCompleted = existing.status === 'completed';
    Object.assign(existing, req.body);
    const task = await existing.save();

    // Gamification: award points on first completion
    let userSummary = undefined;
    if (task.status === 'completed' && !wasCompleted) {
      req.user.points = (req.user.points || 0) + 10;
      const thresholds = [100, 250, 500];
      const badgeNames = { 100: 'Bronze Achiever', 250: 'Silver Achiever', 500: 'Gold Achiever' };
      const currentBadges = new Set(req.user.badges || []);
      thresholds.forEach(t => { if ((req.user.points || 0) >= t) currentBadges.add(badgeNames[t]); });
      req.user.badges = Array.from(currentBadges);
      await req.user.save();
      userSummary = { points: req.user.points, badges: req.user.badges };
    }

    // Notify on completion transition
    if (task.status === 'completed' && !wasCompleted) {
      try {
        const populated = await Task.findById(task._id)
          .populate('user', 'name email')
          .populate('assignee', 'name email')
          .populate('assignedBy', 'name email');
        const recipients = new Set();
        if (populated.user?.email) recipients.add(populated.user.email);
        if (populated.assignee?.email) recipients.add(populated.assignee.email);
        if (populated.assignedBy?.email) recipients.add(populated.assignedBy.email);
        const subject = `Task completed: ${populated.title}`;
        const html = [
          `<p>The task <b>${populated.title}</b> was marked as completed.</p>`,
          populated.dueDate ? `<p>Due: ${new Date(populated.dueDate).toLocaleString()}</p>` : ''
        ].filter(Boolean).join('');
        for (const to of recipients) {
          await sendEmail({ to, subject, html });
        }
      } catch (e) {
        console.error('[notify completion] error:', e.message);
      }
    }

    res.json(userSummary ? { task, user: userSummary } : { task });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Assign a task to a project member or owner
router.patch('/:id/assign', async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    // Permission: owner or project editor/owner
    let canAssign = String(task.user) === String(req.user._id);
    let project = null;
    if (task.project) {
      project = await Project.findById(task.project);
      if (project) {
        const isOwner = String(project.user) === String(req.user._id);
        const isEditor = project.members?.some(m => String(m.user) === String(req.user._id) && m.role === 'editor');
        canAssign = canAssign || isOwner || isEditor;
      }
    }
    if (!canAssign) return res.status(403).json({ message: 'Forbidden' });

    // Validate assignee: must be project owner or member if project set; otherwise any user is allowed
    if (project) {
      const isOwnerOrMember = String(project.user) === String(userId) || project.members?.some(m => String(m.user) === String(userId));
      if (!isOwnerOrMember) return res.status(400).json({ message: 'Assignee must be project member' });
    }

    task.assignee = userId;
    task.assignedBy = req.user._id;
    task.assignedAt = new Date();
    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('assignedBy', 'name email');
    res.json({ task: populated });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

export default router;
