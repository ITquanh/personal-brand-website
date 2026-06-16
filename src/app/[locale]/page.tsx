'use client';

import { getDictionary, type Locale } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/layout/ThemeToggle';
import HeroTerminal from '@/components/home/HeroTerminal';
import BentoGrid from '@/components/home/BentoGrid';
import CommandPalette from '@/components/command/CommandPalette';
import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const [dict, setDict] = useState<any>(null);
  const { theme } = useTheme();
  const [showHero, setShowHero] = useState(true);
  const [terminalComplete, setTerminalComplete] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  // 监听Ctrl+K快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 并行获取数据
        const [projectsRes, skillsRes, postsRes, configRes] = await Promise.all([
          fetch(`/api/projects?featured=true&locale=${locale}&limit=4`),
          fetch('/api/skills'),
          fetch(`/api/posts?locale=${locale}&limit=3`),
          fetch('/api/site-config')
        ]);

        const [projectsData, skillsData, postsData, configJson] = await Promise.all([
          projectsRes.json(),
          skillsRes.json(),
          postsRes.json(),
          configRes.json(),
        ]);

        if (projectsData.success) setProjects(projectsData.data);
        if (skillsData.success) setSkills(skillsData.data);
        if (postsData.success) setPosts(postsData.data);
        if (configJson.success) setConfigData(configJson.data);

      } catch (err) {
        console.error('获取数据失败:', err);
        setError('加载数据失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  if (!dict || !configData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="terminal-text">加载中...</div>
      </div>
    );
  }

  const isEn = locale === 'en';
  const displaySiteTitle = isEn && configData.siteTitleEn ? configData.siteTitleEn : configData.siteTitle;
  const displayName = isEn && configData.nameEn ? configData.nameEn : configData.name;
  const displayJobTitle = isEn && configData.jobTitleEn ? configData.jobTitleEn : configData.jobTitle;
  const displayBio = isEn && configData.bioEn ? configData.bioEn : configData.bio;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="terminal-text font-mono text-lg">
            {'>'} {displaySiteTitle || dict.common.siteTitle}
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <a href={`/${locale}`} className="text-foreground hover:text-accent-green">
                {dict.common.home}
              </a>
              <a href={`/${locale}/about`} className="text-foreground/80 hover:text-foreground">
                {dict.common.about}
              </a>
              <a href={`/${locale}/projects`} className="text-foreground/80 hover:text-foreground">
                {dict.common.projects}
              </a>
              <a href={`/${locale}/blog`} className="text-foreground/80 hover:text-foreground">
                {dict.common.blog}
              </a>
            </nav>
            <ThemeToggle />
            <a
              href={locale === 'zh' ? '/en' : '/zh'}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Terminal Animation */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-4">
        {showHero ? (
          <HeroTerminal
            onComplete={() => {
              setTerminalComplete(true);
              setTimeout(() => setShowHero(false), 800);
            }}
            skipable={true}
            locale={locale}
            configData={configData}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {dict.hero.greeting}{' '}
              <span className="text-accent-green">{displayName || dict.hero.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-foreground/80 mb-4">
              {displayJobTitle || dict.hero.title}
            </h2>
            <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto whitespace-pre-wrap">
              {displayBio || dict.hero.description}
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href={`/${locale}/projects`}
                className="bg-accent-green text-background px-6 py-3 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
              >
                {dict.projects.viewProject}
              </a>
              <a
                href={`/${locale}/about`}
                className="glass-card px-6 py-3 rounded-lg font-medium hover:bg-foreground/10 transition-colors"
              >
                {dict.common.about}
              </a>
            </div>
          </motion.div>
        )}
      </section>

      {/* Bento Grid Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center">
              {dict.projects.featured}
            </h2>

            {/* 错误提示 */}
            {error && (
              <div className="text-center mb-8 p-4 glass-card bg-red-500/10 border-red-500/20">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* 加载状态 */}
            {loading ? (
              <div className="bento-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-6 animate-pulse">
                    <div className="h-32 bg-card-bg rounded-lg mb-4"></div>
                    <div className="h-4 bg-card-bg rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-card-bg rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <BentoGrid
                featuredProjects={projects}
                skills={skills}
                recentPosts={posts}
                locale={locale}
                dict={dict}
                configData={configData}
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* 命令面板 */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        configData={configData}
      />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-card-border">
        <div className="max-w-6xl mx-auto text-center text-foreground/40 text-sm">
          <p>© 2024 {displaySiteTitle || dict.common.siteTitle}. {dict.footer.copyright}</p>
          <p className="mt-2">{dict.footer.builtWith}</p>
        </div>
      </footer>
    </main>
  );
}
