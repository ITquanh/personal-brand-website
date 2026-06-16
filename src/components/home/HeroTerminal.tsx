'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { siteConfig } from '@/config/site';

interface HeroTerminalProps {
  onComplete: () => void;
  skipable?: boolean;
  locale?: string;
  configData?: any;
}

function getCommands(locale: string = 'zh', configData?: any) {
  const isEn = locale === 'en';
  const data = configData || siteConfig;
  return [
    { text: '$ whoami', delay: 100 },
    { text: '', delay: 500 },
    { text: isEn ? (data.jobTitleEn || data.jobTitle) : data.jobTitle, delay: 800 },
    { text: '', delay: 300 },
    { text: '$ cat skills.txt', delay: 100 },
    { text: '', delay: 400 },
    ...(data.terminalSkills || siteConfig.terminal.skills).map((skill: string) => ({ text: skill, delay: 500 })),
    { text: '', delay: 300 },
    { text: '$ ./deploy_future.sh', delay: 100 },
    { text: '', delay: 400 },
    { text: isEn ? '✓ Deployed successfully! Welcome to my digital space' : (data.terminalWelcomeMessage || siteConfig.terminal.welcomeMessage), delay: 600 },
  ];
}

export default function HeroTerminal({ onComplete, skipable = true, locale = 'zh', configData }: HeroTerminalProps) {
  const COMMANDS = getCommands(locale, configData);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);

  // 显示跳过按钮
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // 自动完成（5秒后）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isComplete) {
        handleComplete();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isComplete]);

  // 打字机效果
  useEffect(() => {
    if (isComplete || currentLineIndex >= COMMANDS.length) {
      return;
    }

    const currentCommand = COMMANDS[currentLineIndex];

    if (currentCharIndex < currentCommand.text.length) {
      // 继续打字
      const timer = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines.length <= currentLineIndex) {
            newLines.push('');
          }
          newLines[currentLineIndex] = currentCommand.text.substring(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 50 + Math.random() * 50); // 随机打字速度

      return () => clearTimeout(timer);
    } else {
      // 当前行完成，进入下一行
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, currentCommand.delay);

      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex, isComplete]);

  // 处理完成
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    setIsTyping(false);

    // 延迟一下再调用onComplete，让用户看到最后的内容
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [onComplete]);

  // 跳过动画
  const handleSkip = useCallback(() => {
    // 显示所有内容
    const allLines = COMMANDS.map(cmd => cmd.text);
    setDisplayedLines(allLines);
    handleComplete();
  }, [handleComplete]);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* 终端窗口 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card overflow-hidden"
      >
        {/* 终端头部 */}
        <div className="flex items-center gap-2 px-4 py-3 bg-card-bg border-b border-card-border">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center text-sm text-foreground/40 font-mono">
            terminal
          </div>
        </div>

        {/* 终端内容 */}
        <div className="p-6 min-h-[300px] font-mono text-sm md:text-base">
          <AnimatePresence>
            {displayedLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-2"
              >
                {line.startsWith('$') ? (
                  <span className="text-accent-green">{line}</span>
                ) : line.startsWith('•') ? (
                  <span className="text-accent-blue">{line}</span>
                ) : line.startsWith('✓') ? (
                  <span className="text-accent-green font-bold">{line}</span>
                ) : (
                  <span className="text-foreground/80">{line}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 光标 */}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-2 h-5 bg-accent-green ml-1"
            />
          )}
        </div>
      </motion.div>

      {/* 跳过按钮 */}
      {skipable && showSkipButton && !isComplete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={handleSkip}
          className="absolute bottom-4 right-4 text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
        >
          {locale === 'en' ? 'Skip Animation →' : '跳过动画 →'}
        </motion.button>
      )}

      {/* 底部提示 */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-6 text-foreground/40"
        >
          <p>{locale === 'en' ? 'Scroll down to explore more ↓' : '向下滚动探索更多 ↓'}</p>
        </motion.div>
      )}
    </div>
  );
}
