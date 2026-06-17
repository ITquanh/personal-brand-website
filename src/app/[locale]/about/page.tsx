'use client';

import { getDictionary, type Locale } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Timeline from '@/components/about/Timeline';
import SkillCloud from '@/components/about/SkillCloud';
import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';

export default function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const [dict, setDict] = useState<any>(null);
  const { theme } = useTheme();
  const [skills, setSkills] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  // 获取技术栈数据和站点配置
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, configRes] = await Promise.all([
          fetch('/api/skills'),
          fetch('/api/site-config')
        ]);
        
        const skillsData = await skillsRes.json();
        if (skillsData.success) {
          setSkills(skillsData.data);
        }

        const configJson = await configRes.json();
        if (configJson.success) {
          setConfigData(configJson.data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, []);

  if (!dict || !configData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="terminal-text">加载中...</div>
      </div>
    );
  }

  const isEn = locale === 'en';
  
  // 处理本地化显示
  const displaySiteTitle = isEn && configData.siteTitleEn ? configData.siteTitleEn : configData.siteTitle;
  const displayName = isEn && configData.nameEn ? configData.nameEn : configData.name;
  const displayBio = isEn && configData.bioEn ? configData.bioEn : configData.bio;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href={`/${locale}`} className="terminal-text font-mono text-lg">
            {'>'} {displaySiteTitle || dict.common.siteTitle}
          </a>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6">
              <a href={`/${locale}`} className="text-foreground/80 hover:text-foreground">
                {dict.common.home}
              </a>
              <a href={`/${locale}/about`} className="text-foreground hover:text-accent-green">
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
              href={locale === 'zh' ? '/en/about' : '/zh/about'}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.about.title}
            </h1>
            <p className="text-xl text-foreground/60 mb-8">
              {dict.about.subtitle}
            </p>
            <div className="w-24 h-1 bg-accent-green mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* 个人简介 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 rounded-full bg-card-bg flex items-center justify-center text-6xl">
                👨‍💻
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">
                  {displayName || dict.hero.name}
                </h2>
                <p className="text-foreground/80 mb-4 whitespace-pre-wrap">
                  {displayBio || dict.hero.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="glass-card px-4 py-2">
                    <div className="text-2xl font-bold text-accent-green">{configData.yearsExperience}</div>
                    <div className="text-sm text-foreground/60">{locale === 'en' ? 'Years Experience' : '年经验'}</div>
                  </div>
                  <div className="glass-card px-4 py-2">
                    <div className="text-2xl font-bold text-accent-blue">{configData.projectsCompleted}</div>
                    <div className="text-sm text-foreground/60">{locale === 'en' ? 'Projects' : '项目'}</div>
                  </div>
                  <div className="glass-card px-4 py-2">
                    <div className="text-2xl font-bold text-accent-purple">{configData.clientsServed}</div>
                    <div className="text-sm text-foreground/60">{locale === 'en' ? 'Clients' : '客户'}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 履历时间轴 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center">
              {dict.about.timeline}
            </h2>
            <Timeline events={configData.timeline} dict={dict} locale={locale} />
          </motion.div>
        </div>
      </section>

      {/* 技术栈 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center">
              {dict.about.skills}
            </h2>
            <SkillCloud skills={skills} viewMode="cloud" />
          </motion.div>
        </div>
      </section>

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
