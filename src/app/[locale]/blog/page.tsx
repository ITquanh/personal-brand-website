'use client';

import { getDictionary, type Locale } from '@/lib/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/layout/ThemeToggle';
import PostList from '@/components/blog/PostList';
import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';

export default function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const [dict, setDict] = useState<any>(null);
  const { theme } = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  // 获取文章列表
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/posts?locale=${locale}&published=true`);
        const data = await res.json();

        if (data.success) {
          setPosts(data.data);

          // 提取所有标签
          const allTags = data.data.flatMap((post: any) => post.tags);
          const uniqueTags = [...new Set(allTags)] as string[];
          setTags(uniqueTags);
        } else {
          setError('获取文章失败');
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        setError('获取文章失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [locale]);

  // 筛选文章
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

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
              href={locale === 'zh' ? '/en/blog' : '/zh/blog'}
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.blog.title}
            </h1>
            <p className="text-xl text-foreground/60 mb-8">
              {dict.blog.subtitle}
            </p>
            <div className="w-24 h-1 bg-accent-green mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* 标签筛选 */}
      <section className="pb-8 px-4">
        <div className="max-w-4xl mx-auto">
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
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  !selectedTag
                    ? 'bg-accent-green text-background'
                    : 'glass-card hover:bg-foreground/10'
                }`}
              >
                {dict.blog.allPosts}
              </button>
              {tags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-accent-green text-background'
                      : 'glass-card hover:bg-foreground/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 文章列表 */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-6 bg-card-bg rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-card-bg rounded w-full mb-2"></div>
                  <div className="h-4 bg-card-bg rounded w-5/6 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-card-bg rounded-full"></div>
                    <div className="h-6 w-16 bg-card-bg rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PostList
              posts={filteredPosts}
              locale={locale}
              dict={dict}
            />
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
