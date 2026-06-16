'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    techStack: string[];
    imageUrl?: string;
    quantifiedImpact?: string;
    isFeatured?: boolean;
  };
  locale: string;
  index: number;
}

export default function ProjectCard({ project, locale, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link href={`/${locale}/projects/${project.slug}`}>
        <div className="glass-card p-6 card-hover h-full flex flex-col">
          {/* 项目图片 */}
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-card-bg">
            {project.imageUrl ? (
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl">🚀</div>
              </div>
            )}

            {/* 精选标签 */}
            {project.isFeatured && (
              <div className="absolute top-2 right-2 bg-accent-green text-background text-xs px-2 py-1 rounded-full">
                精选
              </div>
            )}
          </div>

          {/* 项目信息 */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {project.title}
            </h3>

            <p className="text-sm text-foreground/60 mb-4 flex-1">
              {project.summary}
            </p>

            {/* 技术栈标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="text-xs bg-card-bg text-foreground/80 px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="text-xs text-foreground/40">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>

            {/* 量化指标 */}
            {project.quantifiedImpact && (
              <div className="text-sm text-accent-green font-medium">
                📊 {project.quantifiedImpact}
              </div>
            )}
          </div>

          {/* 悬停效果 */}
          <div className="mt-4 flex items-center text-sm text-foreground/40 group-hover:text-accent-green transition-colors">
            <span>查看详情</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
