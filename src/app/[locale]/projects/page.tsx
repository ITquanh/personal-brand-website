'use client';

import { getDictionary, type Locale } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/layout/ThemeToggle';
import ProjectWall from '@/components/projects/ProjectWall';
import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const [dict, setDict] = useState<any>(null);
  const { theme } = useTheme();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  // 获取所有技术栈标签
  useEffect(() => {
    const fetchTechStacks = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/skills');
        const data = await res.json();

        if (data.success) {
          const techs = data.data.map((skill: any) => skill.name);
          setTechStacks([...new Set(techs)] as string[]);
        } else {
          setError('获取技术栈失败');
        }
      } catch (error) {
        console.error('获取技术栈失败:', error);
        setError('获取技术栈失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTechStacks();
  }, []);

  if (!dict) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="terminal-text">加载中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href={`/${locale}`} className="terminal-text font-mono text-lg">
            {'>'} {dict.common.siteTitle}
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <a href={`/${locale}`} className="text-foreground/80 hover:text-foreground">
                {dict.common.home}
              </a>
              <a href={`/${locale}/about`} className="text-foreground/80 hover:text-foreground">
                {dict.common.about}
              </a>
              <a href={`/${locale}/projects`} className="text-foreground hover:text-accent-green">
                {dict.common.projects}
              </a>
              <a href={`/${locale}/blog`} className="text-foreground/80 hover:text-foreground">
                {dict.common.blog}
              </a>
            </nav>
            <ThemeToggle />
            <a
              href={locale === 'zh' ? '/en/projects' : '/zh/projects'}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.projects.title}
            </h1>
            <p className="text-xl text-foreground/60 mb-8">
              {dict.projects.subtitle}
            </p>
            <div className="w-24 h-1 bg-accent-green mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* 技术栈筛选 */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-card-bg rounded-full animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-foreground/40 text-sm">
              {error}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedTech(null)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  !selectedTech
                    ? 'bg-accent-green text-background'
                    : 'glass-card hover:bg-foreground/10'
                }`}
              >
                {dict.projects.allProjects}
              </button>
              {techStacks.slice(0, 8).map((tech) => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(tech === selectedTech ? null : tech)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedTech === tech
                      ? 'bg-accent-green text-background'
                      : 'glass-card hover:bg-foreground/10'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 项目列表 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <ProjectWall locale={locale} dict={dict} techFilter={selectedTech} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-card-border">
        <div className="max-w-6xl mx-auto text-center text-foreground/40 text-sm">
          <p>© 2024 {dict.common.siteTitle}. {dict.footer.copyright}</p>
          <p className="mt-2">{dict.footer.builtWith}</p>
        </div>
      </footer>
    </main>
  );
}
