import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTask, selectTasks } from '../store/tasksSlice';
import { selectUser } from '../store/userSlice';

  function format(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

export default function Sprint() {
  const dispatch = useDispatch();
  const { items } = useSelector(selectTasks);
  const { info: userInfo } = useSelector(selectUser);
  const [selected, setSelected] = useState({});
  const [minutes, setMinutes] = useState(25);
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState(null);
  const tickRef = useRef(null);

  useEffect(() => { dispatch(fetchTasks({ status: 'pending' })); }, [dispatch]);

  const pickedTasks = useMemo(() => items.filter(t => selected[t._id]), [items, selected]);

  const remaining = endAt ? endAt - Date.now() : 0;
  const percent = endAt ? Math.min(100, Math.max(0, (1 - remaining / (minutes * 60 * 1000)) * 100)) : 0;

  // Gamification helpers
  const points = userInfo?.points || 0;
  const badges = userInfo?.badges || [];
  const thresholds = [100, 250, 500];
  const nextTarget = thresholds.find(t => points < t);

  const start = () => {
    const now = Date.now();
    setEndAt(now + minutes * 60 * 1000);
    setRunning(true);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (endAt && Date.now() >= endAt) {
        clearInterval(tickRef.current);
        setRunning(false);
        chime();
      } else {
        // force re-render
        setEndAt(prev => prev ? prev : now + minutes * 60 * 1000);
      }
    }, 250);
  };

  const stop = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setRunning(false);
    setEndAt(null);
  };

  const togglePick = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const completeTask = (t) => {
    const data = { status: 'completed', completedAt: new Date().toISOString() };
    dispatch(updateTask({ id: t._id, data }));
  };

  const chime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.001;
      o.start();
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-6 lg:col-span-1">
        <h1 className="text-lg font-semibold mb-4">Start a Sprint</h1>
        <div className="flex gap-2 mb-3">
          <button className={`px-3 py-2 rounded border ${minutes===25?'bg-brand-600 text-white':''}`} onClick={()=>setMinutes(25)}>25 min</button>
          <button className={`px-3 py-2 rounded border ${minutes===50?'bg-brand-600 text-white':''}`} onClick={()=>setMinutes(50)}>50 min</button>
          <input type="number" min={5} max={180} className="input w-24" value={minutes} onChange={e=>setMinutes(Number(e.target.value)||25)} />
        </div>
        <div className="card p-4 flex flex-col items-center">
          <div className="text-4xl font-bold">{format(remaining || minutes*60*1000)}</div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded mt-3">
            <div className="h-2 bg-brand-600 rounded" style={{ width: `${percent}%` }} />
          </div>
          {/* Points and milestones */}
          <div className="mt-4 w-full text-sm flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Points</span>
              <span className="font-medium">{points}</span>
            </div>
            {typeof nextTarget !== 'undefined' ? (
              <div className="text-xs text-gray-500">{nextTarget - points} pts to next badge</div>
            ) : (
              <div className="text-xs text-green-600">Max badge tier reached 🎉</div>
            )}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {badges.map((b) => (
                  <span key={b} className="px-2 py-0.5 text-xs rounded-full border bg-white/60 dark:bg-gray-900/40">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            {!running ? (
              <button className="btn" onClick={start}>Start</button>
            ) : (
              <button className="px-4 py-2 rounded border" onClick={stop}>Stop</button>
            )}
          </div>
        </div>
      </div>
      <div className="card p-6 lg:col-span-2">
        <h2 className="font-semibold mb-3">Pick tasks to focus</h2>
        <div className="grid sm:grid-cols-2 gap-2 mb-4 max-h-64 overflow-auto">
          {items.filter(t => t.status !== 'completed').map(t => (
            <label key={t._id} className="flex items-center gap-2 p-2 rounded border cursor-pointer">
              <input type="checkbox" checked={!!selected[t._id]} onChange={()=>togglePick(t._id)} />
              <span className="truncate">{t.title}</span>
            </label>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-500">No tasks available</p>}
        </div>
        {pickedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Sprint checklist</h3>
            <ul className="space-y-2">
              {pickedTasks.map(t => (
                <li key={t._id} className="flex items-center gap-2">
                  <button className="px-2 py-1 text-xs rounded border" onClick={()=>completeTask(t)}>Done</button>
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
