'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useState, useEffect, useRef, useCallback } from 'react';
import CommentSection from './CommentSection';

// 从 React children 中提取纯文本（解决 String(children) 返回 [object Object] 的问题）
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (typeof children === 'object' && children !== null && 'props' in children) {
    const element = children as React.ReactElement<any>;
    if (element.props.children) return extractText(element.props.children);
  }
  return '';
}

// 生成唯一的 URL 友好 ID
function slugify(text: React.ReactNode): string {
  return extractText(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '') || 'heading';
}

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  readTime: number;
  viewCount: number;
  translationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostContentProps {
  post: Post;
  locale: string;
  dict: any;
}

export default function PostContent({
  post,
  locale,
  dict,
}: PostContentProps) {
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([]);
  const [activeHeading, setActiveHeading] = useState<string>('');

  // 提取标题生成目录
  useEffect(() => {
    const extractedHeadings: { id: string; text: string; level: number }[] = [];
    const regex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = regex.exec(post.content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);
  }, [post.content]);

  // 监听滚动，高亮当前标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="flex gap-8">
      {/* 目录 - 桌面端固定 */}
      {headings.length > 0 && (
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="text-sm font-bold mb-4 text-foreground/60">
              {dict.blog.title || '目录'}
            </h3>
            <nav className="space-y-2">
              {headings.map(({ id, text, level }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`block text-sm transition-colors ${
                    level === 1
                      ? 'font-bold'
                      : level === 2
                      ? 'pl-4'
                      : 'pl-8'
                  } ${
                    activeHeading === id
                      ? 'text-accent-green'
                      : 'text-foreground/40 hover:text-foreground/60'
                  }`}
                >
                  {text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* 文章内容 */}
      <article className="flex-1 max-w-3xl">
        {/* 返回按钮 */}
        <Link
          href={`/${locale}/blog`}
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

        {/* 文章头部 */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {post.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/40 mb-6">
            <span className="flex items-center gap-1">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {post.readTime} {dict.blog.minutes}
            </span>
            <span className="flex items-center gap-1">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {post.viewCount} {dict.blog.views}
            </span>
            <span>
              {dict.blog.publishedAt}{' '}
              {new Date(post.createdAt).toLocaleDateString(
                locale === 'zh' ? 'zh-CN' : 'en-US'
              )}
            </span>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 bg-card-bg rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 封面图 */}
          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden mb-8">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={800}
                height={450}
                className="w-full object-cover"
              />
            </div>
          )}
        </motion.header>

        {/* Markdown内容 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ children, ...props }) => {
                const id = slugify(children);
                return <h1 id={id} {...props}>{children}</h1>;
              },
              h2: ({ children, ...props }) => {
                const id = slugify(children);
                return <h2 id={id} {...props}>{children}</h2>;
              },
              h3: ({ children, ...props }) => {
                const id = slugify(children);
                return <h3 id={id} {...props}>{children}</h3>;
              },
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                return isInline ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <div className="relative">
                    <div className="absolute top-2 right-2 text-xs text-foreground/40">
                      {match ? match[1] : ''}
                    </div>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </div>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* 文章底部 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-card-border"
        >
          <div className="flex justify-between items-center">
            <div className="text-sm text-foreground/40">
              最后更新: {new Date(post.updatedAt).toLocaleDateString()}
            </div>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 bg-accent-green text-background px-6 py-3 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
            >
              {dict.blog.allPosts}
            </Link>
          </div>
        </motion.footer>

        {/* 评论区 */}
        <CommentSection
          repo={process.env.NEXT_PUBLIC_GISCUS_REPO || ''}
          repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID || ''}
          category="Announcements"
          categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ''}
          mapping="pathname"
          reactionsEnabled={true}
          emitMetadata={false}
          inputPosition="bottom"
          lang="zh-CN"
        />
      </article>
    </div>
  );
}
