'use client';

import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import SkillCloud from '@/components/about/SkillCloud';
import { siteConfig } from '@/config/site';

interface BentoGridProps {
  featuredProjects: any[];
  skills: any[];
  recentPosts: any[];
  locale: string;
  dict: any;
  configData?: any;
}

export default function BentoGrid({
  featuredProjects,
  skills,
  recentPosts,
  locale,
  dict,
  configData,
}: BentoGridProps) {
  const isEn = locale === 'en';
  const data = configData || siteConfig;
  const displayName = isEn ? (data.nameEn || data.name) : data.name;
  const displayTitle = isEn ? (data.jobTitleEn || data.jobTitle) : data.jobTitle;
  const displayBio = isEn ? (data.bioEn || data.bio) : data.bio;
  const githubUrl = data.githubUrl || siteConfig.github.url;
  const email = data.email || siteConfig.email;
  return (
    <div className="bento-grid">
      {/* 个人简介卡片 - 占据2列 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="col-span-2 glass-card p-8 card-hover"
      >
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-card-bg flex items-center justify-center text-4xl">
            👨‍💻
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">{displayName || dict.hero.name}</h3>
            <p className="text-foreground/60 mb-4">{displayTitle || dict.hero.title}</p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{displayBio || dict.hero.description}</p>
          </div>
        </div>
      </motion.div>

      {/* 技术栈雷达卡片 - 占据2列 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="col-span-2 glass-card p-8 card-hover"
      >
        <h3 className="text-xl font-bold mb-4">{dict.about.skills}</h3>
        <div className="h-64">
          {skills.length > 0 ? (
            <SkillCloud skills={skills} viewMode="radar" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/40">
              {dict.common.comingSoon}
            </div>
          )}
        </div>
      </motion.div>

      {/* 精选项目卡片 */}
      {featuredProjects.slice(0, 2).map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          viewport={{ once: true }}
        >
          <ProjectCard
            project={project}
            locale={locale}
            index={index}
          />
        </motion.div>
      ))}

      {/* 最新文章卡片 - 占据2列 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="col-span-2 glass-card p-8 card-hover"
      >
        <h3 className="text-xl font-bold mb-4">{dict.blog.latestPosts}</h3>
        <div className="space-y-4">
          {recentPosts.length > 0 ? (
            recentPosts.slice(0, 3).map((post) => (
              <a
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="block p-4 rounded-lg bg-card-bg hover:bg-card-bg/80 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{post.title}</h4>
                  <span className="text-xs text-foreground/40">
                    {post.readTime} {dict.blog.minutes}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 line-clamp-2">
                  {post.summary}
                </p>
                <div className="flex gap-2 mt-2">
                  {post.tags.slice(0, 3).map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs bg-card-border px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))
          ) : (
            <div className="text-center text-foreground/40 py-8">
              {dict.blog.noPosts}
            </div>
          )}
        </div>
      </motion.div>

      {/* 联系方式卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        viewport={{ once: true }}
        className="glass-card p-8 card-hover"
      >
        <h3 className="text-xl font-bold mb-4">{dict.footer.social}</h3>
        <div className="space-y-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-foreground/60 hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-foreground/60 hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{dict.footer.email}</span>
          </a>
        </div>
      </motion.div>

      {/* 命令面板提示卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        viewport={{ once: true }}
        className="glass-card p-8 card-hover flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⌨️</div>
          <p className="text-sm text-foreground/60">
            按 <kbd className="px-2 py-1 bg-card-bg rounded text-foreground">Ctrl + K</kbd>
          </p>
          <p className="text-xs text-foreground/40 mt-1">
            打开命令面板
          </p>
        </div>
      </motion.div>
    </div>
  );
}
