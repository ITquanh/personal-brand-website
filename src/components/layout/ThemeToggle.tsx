'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const translations = {
  zh: {
    darkMode: '切换到暗色模式',
    lightMode: '切换到亮色模式',
  },
  en: {
    darkMode: 'Switch to Dark Mode',
    lightMode: 'Switch to Light Mode',
  },
};

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // 从URL判断当前语言
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const t = translations[locale];

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-card-bg border border-card-border p-1 transition-colors"
      whileTap={{ scale: 0.95 }}
      aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-primary"
        animate={{
          x: theme === 'dark' ? 0 : 24,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      <span className="sr-only">
        {theme === 'dark' ? t.lightMode : t.darkMode}
      </span>
    </motion.button>
  );
}
