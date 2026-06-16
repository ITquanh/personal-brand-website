'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && (saved === 'dark' || saved === 'light')) {
        setTheme(saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // localStorage 不可用时（隐私模式等），默认深色模式
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // localStorage 不可用时忽略
    }
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // 始终包裹 Provider，确保子组件能访问 Context
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
