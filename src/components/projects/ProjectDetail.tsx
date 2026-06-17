'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  techStack: string[];
  architecture?: string;
  quantifiedImpact?: string;
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  translationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectDetailProps {
  project: Project;
  locale: string;
  dict: any;
}

export default function ProjectDetail({
  project,
  locale,
  dict,
}: ProjectDetailProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* 项目头部 */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        {/* 返回按钮 */}
        <Link
          href={`/${locale}/projects`}
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {dict.common.back}
        </Link>

        {/* 项目标题 */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {project.title}
        </h1>

        {/* 项目摘要 */}
        <p className="text-xl text-foreground/60 mb-6">
          {project.summary}
        </p>

        {/* 量化指标 */}
        {project.quantifiedImpact && (
          <div className="glass-card inline-block px-4 py-2 mb-6">
            <span className="text-accent-green font-bold">
              📊 {project.quantifiedImpact}
            </span>
          </div>
        )}

        {/* 技术栈标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(project.techStack ?? []).map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-card-bg rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {dict.projects.viewCode}
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent-green text-background px-6 py-3 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {dict.projects.liveDemo}
            </a>
          )}
        </div>
      </motion.header>

      {/* 项目图片 */}
      {project.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 rounded-xl overflow-hidden"
        >
          <Image
            src={project.imageUrl}
            alt={project.title}
            width={800}
            height={450}
            className="w-full object-cover"
          />
        </motion.div>
      )}

      {/* 架构解析 */}
      {project.architecture && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">
            {dict.projects.architecture}
          </h2>
          <div className="glass-card p-8">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {project.architecture}
              </ReactMarkdown>
            </div>
          </div>
        </motion.section>
      )}

      {/* 项目元信息 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 技术栈详情 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">{dict.projects.techStack}</h3>
            <div className="space-y-3">
              {(project.techStack ?? []).map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 项目信息 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">{dict.projects.projectInfo}</h3>
            <div className="space-y-3">
              {project.createdAt && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">{dict.projects.createdAt}</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {project.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">{dict.projects.updatedAt}</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
              {project.translationStatus && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">{dict.projects.translationStatus}</span>
                  <span
                    className={
                      project.translationStatus === 'translated' || project.translationStatus === 'reviewed'
                        ? 'text-accent-green'
                        : 'text-foreground/40'
                    }
                  >
                    {project.translationStatus === 'reviewed'
                      ? dict.projects.statusReviewed
                      : project.translationStatus === 'translated'
                      ? dict.projects.statusTranslated
                      : dict.projects.statusUntranslated}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 返回按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-center"
      >
        <Link
          href={`/${locale}/projects`}
          className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-lg font-medium hover:bg-foreground/10 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {dict.projects.allProjects}
        </Link>
      </motion.div>
    </article>
  );
}
