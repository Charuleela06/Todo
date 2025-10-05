import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button onClick={() => setDark(v => !v)} className="rounded-lg border px-3 py-1 text-sm">
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
