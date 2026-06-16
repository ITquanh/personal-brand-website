'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { siteConfig } from '@/config/site';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  configData?: any;
}

interface Command {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

const translations = {
  zh: {
    placeholder: '输入命令...',
    noMatch: '未找到匹配的命令',
    navigate: '导航',
    execute: '执行',
    close: '关闭',
    commands: '个命令',
    helpDesc: '显示所有可用命令',
    contactDesc: '显示联系方式',
    resumeDesc: '下载PDF简历',
    themeDesc: '切换深色/明亮模式',
    homeDesc: '返回首页',
    aboutDesc: '关于我',
    projectsDesc: '项目展示',
    blogDesc: '博客',
    adminDesc: '管理后台',
  },
  en: {
    placeholder: 'Type a command...',
    noMatch: 'No matching commands found',
    navigate: 'Navigate',
    execute: 'Execute',
    close: 'Close',
    commands: 'commands',
    helpDesc: 'Show all available commands',
    contactDesc: 'Show contact info',
    resumeDesc: 'Download PDF resume',
    themeDesc: 'Toggle dark/light mode',
    homeDesc: 'Go to homepage',
    aboutDesc: 'About me',
    projectsDesc: 'View projects',
    blogDesc: 'View blog',
    adminDesc: 'Admin dashboard',
  },
};

export default function CommandPalette({
  isOpen,
  onClose,
  configData,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme } = useTheme();

  // 从URL判断当前语言
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';
  const t = translations[locale];
  const prefix = locale === 'en' ? '/en' : '/zh';
  const data = configData || siteConfig;

  // 定义命令列表
  const commands: Command[] = [
    {
      id: 'help',
      name: 'help',
      description: t.helpDesc,
      icon: '❓',
      action: () => {
        const helpText = locale === 'en'
          ? 'Available commands:\n• help - Show help\n• contact - Show contact\n• resume - Download resume\n• theme - Toggle theme\n• home - Go home\n• about - About me\n• projects - Projects\n• blog - Blog'
          : '可用命令：\n• help - 显示帮助\n• contact - 显示联系方式\n• resume - 下载简历\n• theme - 切换主题\n• home - 返回首页\n• about - 关于我\n• projects - 项目展示\n• blog - 博客';
        alert(helpText);
      },
    },
    {
      id: 'contact',
      name: 'contact',
      description: t.contactDesc,
      icon: '📧',
      action: () => {
        const contactText = locale === 'en'
          ? `Contact:\n• GitHub: ${data.github?.url || data.githubUrl}\n• Email: ${data.email}\n• LinkedIn: ${data.linkedin?.url || data.linkedinUrl}`
          : `联系方式：\n• GitHub: ${data.github?.url || data.githubUrl}\n• Email: ${data.email}\n• LinkedIn: ${data.linkedin?.url || data.linkedinUrl}`;
        alert(contactText);
      },
    },
    {
      id: 'resume',
      name: 'resume',
      description: t.resumeDesc,
      icon: '📄',
      action: () => {
        alert(locale === 'en' ? 'Resume download coming soon!' : '简历下载功能即将推出！');
      },
    },
    {
      id: 'theme',
      name: 'theme',
      description: t.themeDesc,
      icon: '🎨',
      action: () => {
        toggleTheme();
      },
    },
    {
      id: 'home',
      name: 'home',
      description: t.homeDesc,
      icon: '🏠',
      action: () => {
        router.push(prefix);
      },
    },
    {
      id: 'about',
      name: 'about',
      description: t.aboutDesc,
      icon: '👤',
      action: () => {
        router.push(`${prefix}/about`);
      },
    },
    {
      id: 'projects',
      name: 'projects',
      description: t.projectsDesc,
      icon: '🚀',
      action: () => {
        router.push(`${prefix}/projects`);
      },
    },
    {
      id: 'blog',
      name: 'blog',
      description: t.blogDesc,
      icon: '📝',
      action: () => {
        router.push(`${prefix}/blog`);
      },
    },
    {
      id: 'admin',
      name: 'admin',
      description: t.adminDesc,
      icon: '⚙️',
      action: () => {
        router.push('/admin');
      },
    },
  ];

  // 过滤命令
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // 执行命令
  const executeCommand = useCallback(
    (command: Command) => {
      command.action();
      onClose();
      setQuery('');
      setSelectedIndex(0);
    },
    [onClose]
  );

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, executeCommand, onClose]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 命令面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="glass-card overflow-hidden shadow-2xl">
              {/* 输入框 */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-card-border">
                <span className="text-foreground/40">{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-foreground/40"
                />
                <kbd className="text-xs text-foreground/40 px-2 py-1 bg-card-bg rounded">
                  ESC
                </kbd>
              </div>

              {/* 命令列表 */}
              <div className="max-h-80 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-foreground/40">
                    {t.noMatch}
                  </div>
                ) : (
                  filteredCommands.map((command, index) => (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => executeCommand(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'hover:bg-foreground/5'
                      }`}
                    >
                      <span className="text-lg">{command.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{command.name}</div>
                        <div className="text-sm text-foreground/40">
                          {command.description}
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <kbd className="text-xs text-foreground/40 px-2 py-1 bg-card-bg rounded">
                          ↵
                        </kbd>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* 底部提示 */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-card-border text-xs text-foreground/40">
                <div className="flex items-center gap-4">
                  <span>
                    <kbd className="px-1 py-0.5 bg-card-bg rounded">↑↓</kbd>{' '}
                    {t.navigate}
                  </span>
                  <span>
                    <kbd className="px-1 py-0.5 bg-card-bg rounded">↵</kbd>{' '}
                    {t.execute}
                  </span>
                  <span>
                    <kbd className="px-1 py-0.5 bg-card-bg rounded">esc</kbd>{' '}
                    {t.close}
                  </span>
                </div>
                <span>{filteredCommands.length} {t.commands}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
