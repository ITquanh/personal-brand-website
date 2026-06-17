'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  readTime: number;
  viewCount: number;
  translationStatus?: string;
  createdAt: string;
}

interface PostListProps {
  posts: Post[];
  locale: string;
  dict: any;
}

export default function PostList({ posts, locale, dict }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-foreground/60">{dict.blog.noPosts}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Link href={`/${locale}/blog/${post.slug}`}>
            <div className="glass-card p-6 card-hover flex flex-col md:flex-row gap-6">
              {/* 文章图片 */}
              {post.imageUrl && (
                <div className="md:w-48 h-32 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={192}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 文章内容 */}
              <div className="flex-1">
                {/* 标题 */}
                <h2 className="text-xl font-bold mb-2 hover:text-accent-green transition-colors">
                  {post.title}
                </h2>

                {/* 摘要 */}
                {post.summary && (
                  <p className="text-foreground/60 mb-4 line-clamp-2">
                    {post.summary}
                  </p>
                )}

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-card-bg rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-sm text-foreground/40">
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
              </div>

              {/* 翻译状态 */}
              {post.translationStatus && (
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      post.translationStatus === 'reviewed'
                        ? 'bg-purple-500/20 text-purple-400'
                        : post.translationStatus === 'translated'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {post.translationStatus === 'reviewed'
                      ? (dict.projects?.statusReviewed || 'Reviewed')
                      : post.translationStatus === 'translated'
                      ? (dict.projects?.statusTranslated || 'Translated')
                      : (dict.projects?.statusUntranslated || 'Untranslated')}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
