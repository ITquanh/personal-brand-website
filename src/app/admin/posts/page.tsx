'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts?limit=100&published=all');
      const data = await res.json();

      if (data.success) {
        setPosts(data.data);
      } else {
        setError('获取文章失败');
      }
    } catch (error) {
      console.error('获取文章失败:', error);
      setError('获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      alert('删除文章失败');
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="px-6 py-2 bg-accent-green text-background rounded-lg hover:bg-accent-green/90"
        >
          创建新文章
        </Link>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-card-bg rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-card-bg rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-foreground/60 mb-4">还没有文章</p>
          <Link
            href="/admin/posts/new"
            className="text-accent-green hover:underline"
          >
            创建第一篇文章
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-card p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{post.titleZh}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      post.published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {post.published ? '已发布' : '草稿'}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      post.translationStatus === 'reviewed'
                        ? 'bg-purple-500/20 text-purple-400'
                        : post.translationStatus === 'translated'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {post.translationStatus === 'reviewed'
                      ? '已审核'
                      : post.translationStatus === 'translated'
                      ? '已翻译'
                      : '未翻译'}
                  </span>
                </div>
                <p className="text-sm text-foreground/60 mb-2 line-clamp-1">
                  {post.summaryZh}
                </p>
                <div className="flex items-center gap-4 text-xs text-foreground/40">
                  <span>{post.readTime} 分钟阅读</span>
                  <span>{post.viewCount} 次阅读</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="px-4 py-2 text-sm glass-card hover:bg-foreground/10 rounded-lg"
                >
                  编辑
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
