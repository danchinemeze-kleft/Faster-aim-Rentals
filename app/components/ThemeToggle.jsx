'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('faim-theme') === 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLight);
    localStorage.setItem('faim-theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  function toggle() {
    setIsLight((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('light-mode', next);
      localStorage.setItem('faim-theme', next ? 'light' : 'dark');
      return next;
    });
  }

  return (
    <button
      onClick={toggle}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9998,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: isLight ? '#1a1a2e' : '#ffffff',
        color: isLight ? '#ffffff' : '#1a1a2e',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        transition: 'background 0.2s, color 0.2s',
        fontFamily: 'inherit',
      }}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  );
}
