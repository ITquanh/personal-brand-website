'use client';

import { getDictionary, type Locale } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/layout/ThemeToggle';
import PostContent from '@/components/blog/PostContent';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BlogPostPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const slug = params.slug as string;

  const [dict, setDict] = useState<any>(null);
  const { theme } = useTheme();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  // 获取文章数据
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/posts/${slug}?locale=${locale}`);
        const data = await res.json();

        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.error || '文章不存在');
        }
      } catch (err) {
        console.error('获取文章失败:', err);
        setError('加载文章失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, locale]);

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
              <a href={`/${locale}/projects`} className="text-foreground/80 hover:text-foreground">
                {dict.common.projects}
              </a>
              <a href={`/${locale}/blog`} className="text-foreground hover:text-accent-green">
                {dict.common.blog}
              </a>
            </nav>
            <ThemeToggle />
            <a
              href={locale === 'zh' ? `/en/blog/${slug}` : `/zh/blog/${slug}`}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </a>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* 加载状态 */}
          {loading && (
            <div className="max-w-3xl">
              <div className="animate-pulse">
                <div className="h-8 bg-card-bg rounded w-1/4 mb-4"></div>
                <div className="h-12 bg-card-bg rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-card-bg rounded w-full mb-2"></div>
                <div className="h-4 bg-card-bg rounded w-5/6 mb-8"></div>
                <div className="h-96 bg-card-bg rounded-xl"></div>
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="max-w-3xl text-center py-16">
              <div className="text-4xl mb-4">😕</div>
              <h2 className="text-2xl font-bold mb-4">{error}</h2>
              <a
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 bg-accent-green text-background px-6 py-3 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
              >
                {dict.blog.allPosts}
              </a>
            </div>
          )}

          {/* 文章内容 */}
          {!loading && !error && post && (
            locale === 'en' && post.translationStatus === 'untranslated' && !post.contentEn ? (
              <div className="max-w-3xl text-center py-16">
                <div className="text-4xl mb-4">🌐</div>
                <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
                <p className="text-foreground/60 mb-6">
                  此文章的英文版本正在翻译中，请先阅读中文版本。
                </p>
                <p className="text-foreground/40 mb-8">
                  This article is being translated. Please read the Chinese version first.
                </p>
                <a
                  href={`/zh/blog/${slug}`}
                  className="inline-flex items-center gap-2 bg-accent-green text-background px-6 py-3 rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
                >
                  阅读中文版本 / Read in Chinese
                </a>
              </div>
            ) : (
              <PostContent
                post={post}
                locale={locale}
                dict={dict}
              />
            )
          )}
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
