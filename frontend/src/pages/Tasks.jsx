import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask, removeTask, selectTasks } from '../store/tasksSlice';
import { fetchTemplates, createTemplate, selectTemplates } from '../store/templatesSlice';
import api from '../lib/api';
import ShareDialog from '../components/ShareDialog';
import NewProjectDialog from '../components/NewProjectDialog';
import TaskQuickView from '../components/TaskQuickView';

function Tasks() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(selectTasks);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: 'Work', subcategory: '', customSubcategory: '', customCategory: '', dueDate: '', project: '' });
  const [assignEmail, setAssignEmail] = useState('');
  const [memberRole, setMemberRole] = useState('viewer');
  const [memberTitle, setMemberTitle] = useState('frontend_developer');
  const [memberTitleCustom, setMemberTitleCustom] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', subcategory: '', q: '', project: '' });
  const [tab, setTab] = useState('tasks'); // 'tasks' | 'projects'
  const [projects, setProjects] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [quickTaskId, setQuickTaskId] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const categories = ['Work', 'Daily Routine', 'Personal', 'Other'];
  const subPresets = {
    'Work': ['Present', 'Project Dues', 'Meeting', 'Interview', 'Code Review', 'Documentation', 'Customâ€¦'],
    'Daily Routine': ['Eating', 'Sleeping', 'Exercise', 'Study', 'Chores', 'Customâ€¦'],
    'Personal': ['Finance', 'Health', 'Family', 'Shopping', 'Travel', 'Customâ€¦'],
    'Other': ['Misc', 'Errands', 'Hobby', 'Customâ€¦']
  };

  const { items: templates } = useSelector(selectTemplates);

  useEffect(() => { dispatch(fetchTasks(filters)); }, [dispatch, filters]);
  useEffect(() => { dispatch(fetchTemplates()); }, [dispatch]);
  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.projects || [])).catch(()=>setProjects([]));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.category === 'Other' && payload.customCategory) payload.category = payload.customCategory;
    if (payload.subcategory === 'Customâ€¦' && payload.customSubcategory) payload.subcategory = payload.customSubcategory;
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.project) delete payload.project;
    if (form.project) {
      if (assignEmail) payload.assignEmail = assignEmail;
      if (memberRole) payload.memberRole = memberRole;
      if (memberTitle) payload.memberTitle = memberTitle === 'other' ? (memberTitleCustom || '') : memberTitle.replace('_', ' ');
    }
    dispatch(createTask(payload));
    setForm({ title: '', description: '', priority: 'medium', category: 'Work', subcategory: '', customSubcategory: '', customCategory: '', dueDate: '', project: '' });
    setAssignEmail(''); setMemberRole('viewer'); setMemberTitle('frontend_developer'); setMemberTitleCustom('');
  };

  const applyTemplate = (id) => {
    const tpl = templates.find(t => t._id === id);
    if (!tpl) return;
    const next = { ...form };
    next.title = tpl.title || '';
    next.description = tpl.description || '';
    next.category = tpl.category || 'Work';
    next.subcategory = tpl.subcategory || '';
    next.priority = tpl.priority || 'medium';
    if (tpl.defaultDueOffsetMinutes && Number(tpl.defaultDueOffsetMinutes) > 0) {
      const dt = new Date(Date.now() + Number(tpl.defaultDueOffsetMinutes) * 60 * 1000);
      next.dueDate = dt.toISOString().slice(0,16);
    }
    setForm(next);
  };

  const saveAsTemplate = async () => {
    const name = window.prompt('Template name');
    if (!name) return;
    const body = {
      name,
      title: form.title,
      description: form.description,
      category: form.category === 'Other' && form.customCategory ? form.customCategory : form.category,
      subcategory: form.subcategory === 'Customâ€¦' ? (form.customSubcategory || '') : form.subcategory,
      priority: form.priority,
      defaultDueOffsetMinutes: 0
    };
    await dispatch(createTemplate(body));
    dispatch(fetchTemplates());
  };

  const toggleComplete = (t) => {
    const next = t.status === 'completed' ? 'pending' : 'completed';
    const data = { status: next };
    if (next === 'completed' && !t.completedAt) data.completedAt = new Date().toISOString();
    if (next !== 'completed') data.completedAt = null;
    dispatch(updateTask({ id: t._id, data }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 card p-6">
        <h2 className="text-lg font-semibold mb-4">New Task</h2>
        {templates.length > 0 && (
          <div className="mb-3 flex gap-2">
            <select className="input" defaultValue="" onChange={e=>{ if(e.target.value) applyTemplate(e.target.value); }}>
              <option value="">Use Templateâ€¦</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <button type="button" onClick={saveAsTemplate} className="px-3 py-2 rounded border">Save as Template</button>
          </div>
        )}
        {templates.length === 0 && (
          <div className="mb-3">
            <button type="button" onClick={saveAsTemplate} className="px-3 py-2 rounded border">Save as Template</button>
          </div>
        )}
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <textarea className="input" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input className="input" type="datetime-local" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
          </div>
          <div>
            <select className="input w-full" value={form.project} onChange={e=>setForm({...form, project: e.target.value})}>
              <option value="">No Project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <div className="mt-2">
              <button type="button" className="px-3 py-2 rounded border" onClick={()=>setNewProjectOpen(true)}>New Project</button>
            </div>
            {form.project && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm block mb-1">Assign to (email)</label>
                  <input className="input w-full" type="email" placeholder="teammate@example.com" value={assignEmail} onChange={e=>setAssignEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm block mb-1">Member role</label>
                    <select className="input w-full" value={memberRole} onChange={e=>setMemberRole(e.target.value)}>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Member title</label>
                    <select className="input w-full" value={memberTitle} onChange={e=>setMemberTitle(e.target.value)}>
                      <option value="frontend_developer">Frontend Developer</option>
                      <option value="backend_developer">Backend Developer</option>
                      <option value="fullstack_developer">Fullstack Developer</option>
                      <option value="designer">Designer</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="qa_engineer">QA Engineer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                {memberTitle === 'other' && (
                  <input className="input w-full" placeholder="Enter custom title" value={memberTitleCustom} onChange={e=>setMemberTitleCustom(e.target.value)} />
                )}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.category} onChange={e=>{
                const cat = e.target.value; setForm({...form, category: cat, subcategory: '', customSubcategory: ''});
              }}>
                {categories.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {form.category === 'Other' && (
                <input className="input" placeholder="Custom category" value={form.customCategory} onChange={e=>setForm({...form,customCategory:e.target.value})} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.subcategory} onChange={e=>setForm({...form, subcategory: e.target.value})}>
                <option value="">Select subcategory</option>
                {(subPresets[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {form.subcategory === 'Customâ€¦' && (
                <input className="input" placeholder="Custom subcategory" value={form.customSubcategory} onChange={e=>setForm({...form,customSubcategory:e.target.value})} />
              )}
            </div>
          </div>
          <button className="btn w-full">Add Task</button>
        </form>
      </div>

      <div className="lg:col-span-2 card p-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex rounded border overflow-hidden">
            <button className={`px-3 py-2 text-sm ${tab==='tasks'?'bg-gray-200 dark:bg-gray-800':''}`} onClick={()=>{ setTab('tasks'); setFilters(fl=>({...fl, project: ''})); }}>Tasks</button>
            <button className={`px-3 py-2 text-sm ${tab==='projects'?'bg-gray-200 dark:bg-gray-800':''}`} onClick={()=>setTab('projects')}>Projects</button>
          </div>
          <div className="ml-auto flex gap-2">
            <button type="button" className="px-3 py-2 rounded border" onClick={()=>setNewProjectOpen(true)}>New Project</button>
            <button type="button" className="px-3 py-2 rounded border" disabled={!filters.project} onClick={()=>setShareOpen(true)}>Share</button>
            {filters.project && (
              <a className="px-3 py-2 rounded border" href={`/projects/${filters.project}/board`}>Board</a>
            )}
          </div>
        </div>

        {/* Header filters when on Tasks tab */}
        {tab === 'tasks' && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
            <select className="input" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select className="input" value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}>
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select className="input" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value, subcategory: ''})}>
              <option value="">All Categories</option>
              {categories.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="input" value={filters.subcategory} onChange={e=>setFilters({...filters, subcategory: e.target.value})} disabled={!filters.category}>
              <option value="">All Subcategories</option>
              {(subPresets[filters.category] || []).filter(s => s !== 'Customâ€¦').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="input" placeholder="Search" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})} />
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Content area */}
        {tab === 'projects' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p._id} className="rounded border p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded" style={{ background: p.color || '#3b82f6' }} />
                    <div className="font-medium">{p.name}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded border text-sm" onClick={()=>{ setFilters(fl=>({ ...fl, project: p._id })); setTab('tasks'); }}>View tasks</button>
                  <a className="px-3 py-1 rounded border text-sm" href={`/projects/${p._id}/board`}>Open board</a>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="text-sm text-gray-500">No projects</div>}
          </div>
        ) : (
          loading ? <p>Loading...</p> : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {items.map(t => (
                <li key={t._id} className="py-3 flex items-center gap-3 cursor-pointer" onClick={()=>{ setQuickTaskId(t._id); setQuickOpen(true); }}>
                  <input type="checkbox" checked={t.status==='completed'} onChange={() => toggleComplete(t)} onClick={(e)=>e.stopPropagation()} />
                  <div className="flex-1">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-full border">{(t.category || 'Other')}</span>
                      {t.subcategory ? <span className="px-2 py-0.5 rounded-full border">{t.subcategory}</span> : null}
                      <span>{t.priority.toUpperCase()}</span>
                      {t.dueDate ? <span>â€¢ due {new Date(t.dueDate).toLocaleString()}</span> : null}
                      {t.assignee ? <span className="px-2 py-0.5 rounded-full border">Assignee set</span> : null}
                    </div>
                  </div>
                  <button className="text-sm px-3 py-1 rounded border" onClick={(e)=>{ e.stopPropagation(); dispatch(removeTask(t._id)); }}>Delete</button>
                </li>
              ))}
              {items.length === 0 && (
                <li className="py-6 text-center text-sm text-gray-500">No tasks found</li>
              )}
            </ul>
          )
        )}
      </div>
    <ShareDialog projectId={filters.project} open={shareOpen} onClose={()=>setShareOpen(false)} onShared={()=>{ /* no-op */ }} />
    <NewProjectDialog
      open={newProjectOpen}
      onClose={()=>setNewProjectOpen(false)}
      onCreated={(p)=>{ setProjects(prev=>[p, ...prev]); setForm(f=>({...f, project: p._id})); setFilters(fl=>({...fl, project: p._id})); }}
    />
    <TaskQuickView taskId={quickTaskId} projectId={filters.project} open={quickOpen} onClose={()=>setQuickOpen(false)} />
    </div>
  );
}
export default Tasks;



